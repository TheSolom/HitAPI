import { Processor } from '@nestjs/bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource, type QueryRunner } from 'typeorm';
import { STATUS_CODES } from 'node:http';
import { ClsService } from 'nestjs-cls';
import { BaseProcessor } from '../../../common/queues/base.processor.js';
import { AppLoggerService } from '../../logger/logger.service.js';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IConsumersService } from '../../consumers/interfaces/consumers-service.interface.js';
import type { IRequestLogsService } from '../../request-logs/interfaces/request-logs-service.interface.js';
import type { IGeoIPService } from '../../geo-ip/interfaces/geo-ip-service.interface.js';
import type { IngestRequestLogsJobData } from '../types/job-data.type.js';

@Processor(QUEUES.REQUEST_LOGS)
@Injectable()
export class RequestLogIngestionProcessor extends BaseProcessor<
    IngestRequestLogsJobData,
    void,
    JOBS.INGEST_REQUEST_LOGS
> {
    private static readonly GEO_IP_CONCURRENCY = 10;
    private static readonly INSERT_CHUNK_SIZE = 500;

    constructor(
        protected readonly logger: AppLoggerService,
        protected readonly cls: ClsService,
        private readonly dataSource: DataSource,
        @Inject(Services.CONSUMERS)
        private readonly consumersService: IConsumersService,
        @Inject(Services.REQUEST_LOGS)
        private readonly requestLogsService: IRequestLogsService,
        @Inject(Services.GEO_IP)
        private readonly geoIPService: IGeoIPService,
    ) {
        super();
        this.logger.setContext(RequestLogIngestionProcessor.name);
    }

    protected async processJob(
        job: Job<IngestRequestLogsJobData, void, JOBS.INGEST_REQUEST_LOGS>,
    ): Promise<void> {
        const { appId, items } = job.data;

        this.logger.debug('Processing request log batch', {
            appId,
            batchSize: items.length,
        });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const [consumerMap, ipMap] = await Promise.all([
                this.processConsumers(queryRunner, appId, items),
                Promise.resolve(this.processGeoIPs(items)),
            ]);

            const entities = this.buildRequestLogEntities(
                appId,
                items,
                consumerMap,
                ipMap,
            );
            await this.bulkInsertRequestLogs(queryRunner, entities);

            await queryRunner.commitTransaction();

            this.logger.log('Transaction committed', {
                appId,
                batchSize: items.length,
                consumers: consumerMap.size,
                geoIPResolved: ipMap.size,
                chunks: Math.ceil(
                    entities.length /
                        RequestLogIngestionProcessor.INSERT_CHUNK_SIZE,
                ),
            });
        } catch (error) {
            await queryRunner.rollbackTransaction();
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
        const uniqueConsumers = new Set(
            items.map((i) => i.request.consumer).filter(Boolean) as string[],
        );
        if (uniqueConsumers.size === 0) return new Map();

        const identifiers = Array.from(uniqueConsumers);
        const existing = await this.consumersService.findAllByIdentifiers(
            appId,
            identifiers,
            queryRunner,
        );
        const consumerMap = new Map<string, number>(
            existing.map((c) => [c.identifier, c.id]),
        );
        const newIdentifiers = identifiers.filter((id) => !consumerMap.has(id));

        if (newIdentifiers.length > 0) {
            const inserted = await this.consumersService.createConsumers(
                appId,
                newIdentifiers.map((identifier) => ({ identifier })),
                queryRunner,
            );
            inserted.forEach((c) => consumerMap.set(c.identifier, c.id));
        }

        return consumerMap;
    }

    private processGeoIPs(
        items: IngestRequestLogsJobData['items'],
    ): Map<string, string | null> {
        const uniqueIps = new Set(
            items.map((i) => i.request.clientIp).filter(Boolean) as string[],
        );
        if (uniqueIps.size === 0) return new Map();

        const ipArray = Array.from(uniqueIps);
        const ipMap = new Map<string, string | null>();
        const chunk = RequestLogIngestionProcessor.GEO_IP_CONCURRENCY;

        for (let i = 0; i < ipArray.length; i += chunk) {
            ipArray.slice(i, i + chunk).forEach((ip) => {
                ipMap.set(
                    ip,
                    this.geoIPService.getCountry(ip)?.countryCode ?? null,
                );
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
            traceId: item.traceId,
            timestamp: new Date(item.request.timestamp),
        }));
    }

    private async bulkInsertRequestLogs(
        queryRunner: QueryRunner,
        entities: ReturnType<
            RequestLogIngestionProcessor['buildRequestLogEntities']
        >,
    ): Promise<void> {
        const chunkSize = RequestLogIngestionProcessor.INSERT_CHUNK_SIZE;
        const totalEntities = entities.length;

        for (let i = 0; i < totalEntities; i += chunkSize) {
            await this.requestLogsService.createRequestLogs(
                entities.slice(i, i + chunkSize),
                queryRunner,
            );
        }
    }

    private extractPath(url: string): string {
        try {
            return new URL(url).pathname;
        } catch {
            return url;
        }
    }
}
