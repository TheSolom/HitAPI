import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IConsumersService } from '../../consumers/interfaces/consumers-service.interface.js';
import type { IRequestLogsService } from '../../request-logs/interfaces/request-logs-service.interface.js';
import type { IGeoIPService } from '../../geo-ip/interfaces/geo-ip-service.interface.js';
import type { IngestRequestLogsJobData } from '../types/job-data.type.js';

@Processor(QUEUES.REQUEST_LOGS)
@Injectable()
export class RequestLogIngestionProcessor extends WorkerHost {
    private static readonly GEO_IP_CONCURRENCY = 10;
    private static readonly INSERT_CHUNK_SIZE = 500;

    constructor(
        @Inject(Services.CONSUMERS)
        private readonly consumersService: IConsumersService,
        @Inject(Services.REQUEST_LOGS)
        private readonly requestLogsService: IRequestLogsService,
        @Inject(Services.GEO_IP)
        private readonly geoIPService: IGeoIPService,
    ) {
        super();
    }

    async process(
        job: Job<IngestRequestLogsJobData, void, JOBS.INGEST_REQUEST_LOGS>,
    ): Promise<void> {
        const { appId, requests } = job.data;

        const consumerMap = await this.resolveConsumers(appId, requests);
        const ipMap = this.resolveGeoIps(requests);

        const entities = this.buildRequestLogEntities(
            appId,
            requests,
            consumerMap,
            ipMap,
        );

        await this.bulkInsertRequestLogs(entities);
    }

    private async resolveConsumers(
        appId: string,
        requests: IngestRequestLogsJobData['requests'],
    ): Promise<Map<string, number>> {
        const identifiers = Array.from(
            new Set(
                requests
                    .map((r) => r.consumer?.identifier)
                    .filter(Boolean) as string[],
            ),
        );

        if (identifiers.length === 0) {
            return new Map();
        }

        const consumerMap = new Map<string, number>();

        const existing = await this.consumersService.findAllByIdentifiers(
            appId,
            identifiers,
        );

        existing.forEach((c) => consumerMap.set(c.identifier, c.id));

        const newConsumers = identifiers
            .filter((id) => !consumerMap.has(id))
            .map(
                (id) =>
                    requests.find((r) => r.consumer?.identifier === id)!
                        .consumer!,
            );

        if (newConsumers.length > 0) {
            const inserted = await this.consumersService.createConsumers(
                appId,
                newConsumers,
            );

            inserted.forEach((c) => consumerMap.set(c.identifier, c.id));
        }

        return consumerMap;
    }

    private resolveGeoIps(
        requests: IngestRequestLogsJobData['requests'],
    ): Map<string, string | null> {
        const uniqueIps = Array.from(
            new Set(
                requests.map((r) => r.clientIp).filter(Boolean) as string[],
            ),
        );

        const ipMap = new Map<string, string | null>();

        for (
            let i = 0;
            i < uniqueIps.length;
            i += RequestLogIngestionProcessor.GEO_IP_CONCURRENCY
        ) {
            const batch = uniqueIps.slice(
                i,
                i + RequestLogIngestionProcessor.GEO_IP_CONCURRENCY,
            );

            const results = batch.map(
                (ip) => this.geoIPService.getCountry(ip) ?? null,
            );

            results.forEach((country, index) => {
                ipMap.set(batch[index], country?.countryCode ?? null);
            });
        }

        return ipMap;
    }

    private buildRequestLogEntities(
        appId: string,
        requests: IngestRequestLogsJobData['requests'],
        consumerMap: Map<string, number>,
        ipMap: Map<string, string | null>,
    ) {
        return requests.map((request) => ({
            requestUuid: request.requestUuid,
            method: request.method,
            path: request.path,
            url: request.url,
            requestSize: request.requestSize,
            requestHeaders: request.requestHeaders,
            requestBody: request.requestBody,
            statusCode: request.statusCode,
            statusText: request.statusText,
            responseTime: request.responseTime,
            responseSize: request.responseSize,
            responseHeaders: request.responseHeaders,
            responseBody: request.responseBody,
            clientIp: request.clientIp,
            clientCountryCode: request.clientIp
                ? (ipMap.get(request.clientIp) ?? undefined)
                : undefined,
            consumer: request.consumer
                ? consumerMap.get(request.consumer.identifier)
                : undefined,
            appId,
            exceptionType: request.exceptionType,
            exceptionMessage: request.exceptionMessage,
            exceptionStacktrace: request.exceptionStacktrace,
            timestamp: request.timestamp,
        }));
    }

    private async bulkInsertRequestLogs(
        entities: ReturnType<
            RequestLogIngestionProcessor['buildRequestLogEntities']
        >,
    ): Promise<void> {
        for (
            let i = 0;
            i < entities.length;
            i += RequestLogIngestionProcessor.INSERT_CHUNK_SIZE
        ) {
            const chunk = entities.slice(
                i,
                i + RequestLogIngestionProcessor.INSERT_CHUNK_SIZE,
            );

            await this.requestLogsService.createRequestLogs(chunk);
        }
    }
}
