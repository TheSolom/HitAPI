import Denque from 'denque';
import type { SyncPayload, StartupData } from '@hitapi/types';
import type { HitAPIConfig } from '../types/config.js';
import { getLogger } from './logging.js';
import type { ILogger } from '../types/logger.js';
import RequestCounter from './request-counter.js';
import RequestLogger from '../request-logger/request-logger.js';
import ValidationErrorCounter from './validation-error-counter.js';
import ServerErrorCounter from './server-error-counter.js';
import ConsumerRegistry from './consumer-registry.js';
import DataSender from './data-sender.js';
import { isValidUUID } from '../utils/index.js';
import { HTTPError } from './http-error.js';

const SYNC_INTERVAL = 60000; // 60 seconds
const INITIAL_SYNC_INTERVAL = 10000; // 10 seconds
const INITIAL_SYNC_INTERVAL_DURATION = 3600000; // 1 hour

export class HitAPIClient {
    #enabled: boolean = true;
    static #instance: HitAPIClient | null = null;
    readonly #syncDataQueue = new Denque<SyncPayload>();
    #startupData: StartupData | null = null;
    #startupDataSent: boolean = false;
    #syncIntervalId: NodeJS.Timeout | null = null;
    readonly #logger: ILogger;
    readonly #clientId: string;
    readonly #requestCounter: RequestCounter;
    readonly #requestLogger: RequestLogger;
    readonly #validationErrorCounter: ValidationErrorCounter;
    readonly #serverErrorCounter: ServerErrorCounter;
    readonly #consumerRegistry: ConsumerRegistry;
    readonly #dataSender: DataSender;

    private constructor({ clientId, requestLogging, logger }: HitAPIConfig) {
        this.#logger = logger ?? getLogger();

        if (!isValidUUID(clientId)) {
            this.#logger.error(
                `Invalid HitAPI client ID '${clientId}' (expecting UUID format)`,
            );
            this.#enabled = false;
        }

        HitAPIClient.#instance = this;
        this.#clientId = clientId;
        this.#requestCounter = new RequestCounter();
        this.#requestLogger = new RequestLogger(requestLogging);
        this.#validationErrorCounter = new ValidationErrorCounter();
        this.#serverErrorCounter = new ServerErrorCounter();
        this.#consumerRegistry = new ConsumerRegistry();
        this.#dataSender = new DataSender(this);
    }

    get enabled(): boolean {
        return this.#enabled;
    }

    get syncDataQueue(): Denque<SyncPayload> {
        return this.#syncDataQueue;
    }

    get startupData(): StartupData | null {
        return this.#startupData;
    }

    set startupDataSent(value: boolean) {
        this.#startupDataSent = value;
    }

    get logger(): ILogger {
        return this.#logger;
    }

    get clientId(): string {
        return this.#clientId;
    }

    get requestCounter(): RequestCounter {
        return this.#requestCounter;
    }
    get requestLogger(): RequestLogger {
        return this.#requestLogger;
    }

    get validationErrorCounter(): ValidationErrorCounter {
        return this.#validationErrorCounter;
    }

    get serverErrorCounter(): ServerErrorCounter {
        return this.#serverErrorCounter;
    }

    get consumerRegistry(): ConsumerRegistry {
        return this.#consumerRegistry;
    }

    public static init(config: HitAPIConfig): HitAPIClient {
        if (HitAPIClient.#instance) {
            return HitAPIClient.#instance;
        }
        return new HitAPIClient(config);
    }

    public static getInstance(): HitAPIClient {
        if (!HitAPIClient.#instance) {
            throw new Error('HitAPI client is not initialized');
        }
        return HitAPIClient.#instance;
    }

    #stopSync(): void {
        if (this.#syncIntervalId) {
            clearInterval(this.#syncIntervalId);
            this.#syncIntervalId = null;
        }
    }

    async #handleShutdown(): Promise<void> {
        this.#enabled = false;
        this.#stopSync();
        await this.#dataSender.sendSyncData();
        await this.#dataSender.sendLogData();
        await this.#requestLogger.close();
        HitAPIClient.#instance = null;
    }

    public static async shutdown(): Promise<void> {
        if (HitAPIClient.#instance) {
            await HitAPIClient.#instance.#handleShutdown();
        }
    }

    public setStartupData(data: StartupData): void {
        this.#startupData = data;
        this.#startupDataSent = false;
    }

    async #sync(): Promise<void> {
        try {
            const promises = [
                this.#dataSender.sendLogData(),
                this.#dataSender.sendSyncData(),
            ];
            if (!this.#startupDataSent) {
                promises.push(this.#dataSender.sendStartupData());
            }

            await Promise.all(promises);
        } catch (error) {
            this.logger.error('Error while syncing with HitAPI Hub', {
                error: error as Error,
            });
        }
    }

    public async startSync(): Promise<void> {
        if (!this.enabled) return;

        await this.#sync();

        this.#syncIntervalId = setInterval(
            () => void this.#sync(),
            INITIAL_SYNC_INTERVAL,
        );

        setTimeout(() => {
            if (this.#syncIntervalId) {
                clearInterval(this.#syncIntervalId);

                this.#syncIntervalId = setInterval(
                    () => void this.#sync(),
                    SYNC_INTERVAL,
                );
            }
        }, INITIAL_SYNC_INTERVAL_DURATION);
    }

    public handleHubError(error: unknown): boolean {
        if (error instanceof HTTPError) {
            const { status } = error.response;

            if (status === 404) {
                this.#logger.error(
                    `Invalid HitAPI client ID: '${this.#clientId}'`,
                );
                this.#enabled = false;
                this.#stopSync();
                return true;
            }
            if (status === 422 || status === 400) {
                this.#logger.error('Received validation error from HitAPI Hub');
                return true;
            }
        }

        return false;
    }
}
