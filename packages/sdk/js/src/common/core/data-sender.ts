import { randomUUID } from 'node:crypto';
import fetchRetry from 'fetch-retry';
import { StatusCodes } from 'http-status-codes';
import type { StartupPayload, SyncPayload } from '@hitapi/types';
import type { HitAPIClient } from './client.js';
import { HTTPError } from './http-error.js';
import { randomDelay } from '../utils/index.js';
import { getCpuUsage, getMemoryUsage } from './resources.js';

const MAX_QUEUE_TIME = 3.6e6; // 1 hour

const fetchWithRetry = fetchRetry(fetch, {
    retries: 3,
    retryDelay: 1000,
    retryOn: [
        StatusCodes.REQUEST_TIMEOUT,
        StatusCodes.TOO_MANY_REQUESTS,
        StatusCodes.INTERNAL_SERVER_ERROR,
        StatusCodes.BAD_GATEWAY,
        StatusCodes.SERVICE_UNAVAILABLE,
        StatusCodes.GATEWAY_TIMEOUT,
    ],
});

export default class DataSender {
    readonly #client: HitAPIClient;

    constructor(client: HitAPIClient) {
        this.#client = client;
    }

    #getApiUrlPrefix(): string {
        const baseURL = 'http://localhost:3000/api';
        const version = '1';
        return `${baseURL}/v${version}/ingest/`;
    }

    async sendData(url: string, payload: unknown): Promise<void> {
        const response: Response = await fetchWithRetry(
            this.#getApiUrlPrefix() + url,
            {
                method: 'POST',
                headers: {
                    'X-Client-ID': this.#client.clientId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            },
        );

        if (!response.ok) {
            throw new HTTPError(response);
        }
    }

    async sendLogData(): Promise<void> {
        await this.#client.requestLogger.rotateFile();

        for (let i = 0; i < 10; i++) {
            const logFile = this.#client.requestLogger.getFile();
            if (!logFile) return;

            if (i >= 1) await randomDelay();

            try {
                const response = await fetchWithRetry(
                    `${this.#getApiUrlPrefix()}logs?fileUuid=${logFile.uuid}`,
                    {
                        method: 'POST',
                        body: await logFile.getContent(),
                        headers: {
                            'X-Client-ID': this.#client.clientId,
                            'Content-Type': 'application/x-ndjson',
                            'Content-Encoding': 'gzip',
                        },
                    },
                );

                if (response.headers.has('Retry-After')) {
                    const retryAfter = Number.parseInt(
                        response.headers.get('Retry-After')!,
                    );
                    if (retryAfter > 0) {
                        this.#client.requestLogger.suspendUntil =
                            Date.now() + retryAfter;
                        await this.#client.requestLogger.clear();
                        return;
                    }
                }

                if (!response.ok) {
                    throw new HTTPError(response);
                }

                await logFile.delete();
            } catch {
                this.#client.requestLogger.retryFileLater(logFile);
                return;
            }
        }
    }

    async sendStartupData(): Promise<void> {
        if (this.#client.startupData) {
            const payload: StartupPayload = {
                messageUuid: randomUUID(),
                ...this.#client.startupData,
            };

            try {
                await this.sendData('startup', payload);
                this.#client.startupDataSent = true;
            } catch (error) {
                const handled = this.#client.handleHubError(error);
                if (!handled) {
                    this.#client.logger.error((error as Error).message);
                    this.#client.logger.debug(
                        'Error while sending startup data to HitAPI Hub (will retry)',
                        { error: error as Error },
                    );
                }
            }
        }
    }

    #isPayloadExpired(payload: SyncPayload): boolean {
        return Date.now() - payload.timestamp > MAX_QUEUE_TIME;
    }

    async #processQueuedPayload(
        payload: SyncPayload,
        index: number,
    ): Promise<void> {
        if (this.#isPayloadExpired(payload)) return;

        if (index >= 1) await randomDelay();

        await this.sendData('sync', payload);
    }

    #handleSyncError(error: unknown, payload: SyncPayload): boolean {
        const handled = this.#client.handleHubError(error);
        if (!handled) {
            this.#client.logger.debug(
                'Error while synchronizing data with HitAPI Hub (will retry)',
                { error: error as Error },
            );
            this.#client.syncDataQueue.push(payload);
        }
        return handled;
    }

    async sendSyncData(): Promise<void> {
        const payload: SyncPayload = {
            messageUuid: randomUUID(),
            requests: this.#client.requestCounter.getAndResetRequests(),
            validationErrors:
                this.#client.validationErrorCounter.getAndResetValidationErrors(),
            serverErrors:
                this.#client.serverErrorCounter.getAndResetServerErrors(),
            consumers:
                this.#client.consumerRegistry.getAndResetUpdatedConsumers(),
            resources: {
                cpuPercent: getCpuUsage(),
                memoryRss: getMemoryUsage(),
            },
            timestamp: Date.now(),
        };
        this.#client.syncDataQueue.push(payload);

        let i = 0;
        while (this.#client.syncDataQueue.length > 0) {
            const payload = this.#client.syncDataQueue.shift();
            if (!payload) continue;

            try {
                await this.#processQueuedPayload(payload, i);
                i += 1;
            } catch (error) {
                const handled = this.#handleSyncError(error, payload);
                if (!handled) break;
            }
        }
    }
}
