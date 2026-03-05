import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DataSource, type QueryRunner } from 'typeorm';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IConsumersService } from '../../consumers/interfaces/consumers-service.interface.js';
import type { IRequestLogsService } from '../../request-logs/interfaces/request-logs-service.interface.js';
import type { IGeoIPService } from '../../geo-ip/interfaces/geo-ip-service.interface.js';
import type { IngestRequestLogsJobData } from '../types/job-data.type.js';

@Processor(QUEUES.REQUEST_LOGS)
@Injectable()
export class RequestLogIngestionProcessor extends WorkerHost {
    private readonly logger = new Logger(RequestLogIngestionProcessor.name);
    private static readonly GEO_IP_CONCURRENCY = 10;
    private static readonly INSERT_CHUNK_SIZE = 500;

    constructor(
        private readonly dataSource: DataSource,
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
        const { appId, items } = job.data;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const consumerMap = await this.processConsumers(
                queryRunner,
                appId,
                items,
            );
            const ipMap = this.processGeoIPs(items);

            const requestLogEntities = this.buildRequestLogEntities(
                appId,
                items,
                consumerMap,
                ipMap,
            );
            await this.bulkInsertRequestLogs(queryRunner, requestLogEntities);

            await queryRunner.commitTransaction();

            this.logger.log(
                `Successfully processed ${items.length} request logs`,
            );
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                this.logger.error(
                    `Failed to process request logs: ${error.message}`,
                    error.stack,
                );
            } else {
                this.logger.error(`Failed to process request logs: ${error}`);
            }
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    private async processConsumers(
        queryRunner: QueryRunner,
        appId: string,
        items: IngestRequestLogsJobData['items'],
    ): Promise<Map<string, number>> {
        const uniqueConsumers = new Set<string>();
        for (const item of items) {
            if (item.request.consumer)
                uniqueConsumers.add(item.request.consumer);
        }

        if (uniqueConsumers.size === 0) return new Map();

        const identifiers = Array.from(uniqueConsumers);

        const existingConsumers =
            await this.consumersService.findAllByIdentifiers(
                appId,
                identifiers,
                queryRunner,
            );

        const consumerMap = new Map<string, number>();
        existingConsumers.forEach((c) => consumerMap.set(c.identifier, c.id));

        const newConsumers = identifiers.filter(
            (identifier) => !consumerMap.has(identifier),
        );
        if (newConsumers.length > 0) {
            const inserted = await this.consumersService.createConsumers(
                appId,
                newConsumers.map((identifier) => ({ identifier })),
                queryRunner,
            );

            inserted.forEach((c) => consumerMap.set(c.identifier, c.id));
        }

        return consumerMap;
    }

    private processGeoIPs(
        items: IngestRequestLogsJobData['items'],
    ): Map<string, string | null> {
        const uniqueIps = new Set<string>();

        for (const item of items) {
            const { clientIp } = item.request;
            if (clientIp) uniqueIps.add(clientIp);
        }

        if (uniqueIps.size === 0) return new Map();

        const ipArray = Array.from(uniqueIps);
        const ipMap = new Map<string, string | null>();

        for (
            let i = 0;
            i < ipArray.length;
            i += RequestLogIngestionProcessor.GEO_IP_CONCURRENCY
        ) {
            const batch = ipArray.slice(
                i,
                i + RequestLogIngestionProcessor.GEO_IP_CONCURRENCY,
            );

            const results = batch.map((ip) => this.geoIPService.getCountry(ip));

            results.forEach((country, index) => {
                ipMap.set(batch[index], country?.countryCode ?? null);
            });
        }

        return ipMap;
    }

    private buildRequestLogEntities(
        appId: string,
        items: IngestRequestLogsJobData['items'],
        consumerMap: Map<string, number>,
        ipMap: Map<string, string | null>,
    ) {
        return items.map((item) => ({
            requestUuid: item.uuid,
            method: item.request.method,
            path: item.request.path ?? this.extractPath(item.request.url),
            url: item.request.url,
            requestSize: item.request.size,
            requestHeaders: item.request.headers,
            requestBody: item.request.body,
            statusCode: item.response.statusCode,
            statusText: STATUS_CODES[item.response.statusCode] ?? 'Unknown',
            responseTime: item.response.responseTime,
            responseSize: item.response.size,
            responseHeaders: item.response.headers,
            responseBody: item.response.body,
            clientIp: item.request.clientIp,
            clientCountryCode: item.request.clientIp
                ? (ipMap.get(item.request.clientIp) ?? undefined)
                : undefined,
            consumer: item.request.consumer
                ? consumerMap.get(item.request.consumer)
                : undefined,
            appId,
            exceptionType: item.exception?.type,
            exceptionMessage: item.exception?.message,
            exceptionStacktrace: item.exception?.stacktrace,
            traceId: item?.traceId,
            timestamp: new Date(item.request.timestamp),
        }));
    }

    private async bulkInsertRequestLogs(
        queryRunner: QueryRunner,
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

            await this.requestLogsService.createRequestLogs(chunk, queryRunner);
        }
    }

    private extractPath(url: string): string {
        try {
            const parsedUrl = new URL(url);
            return parsedUrl.pathname;
        } catch {
            return url;
        }
    }
}
