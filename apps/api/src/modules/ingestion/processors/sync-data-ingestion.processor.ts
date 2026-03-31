import { Processor } from '@nestjs/bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { DataSource, type QueryRunner } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import type { ConsumerInfo } from '@hitapi/types';
import { BaseProcessor } from '../../../common/queues/base.processor.js';
import { AppLoggerService } from '../../logger/logger.service.js';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IConsumersService } from '../../consumers/interfaces/consumers-service.interface.js';
import type { IConsumerGroupsService } from '../../consumers/interfaces/consumer-groups-service.interface.js';
import type { IEndpointsService } from '../../endpoints/interfaces/endpoints-service.interface.js';
import type { IValidationErrorsService } from '../../errors/interfaces/validation-errors-service.interface.js';
import type { IServerErrorsService } from '../../errors/interfaces/server-errors-service.interface.js';
import type { ITrafficService } from '../../traffic/interfaces/traffic-service.interface.js';
import type { IResourcesService } from '../../resources/interfaces/resources-service.interface.js';
import type { IngestSyncDataJobData } from '../types/job-data.type.js';
import type {
    RequestsItemDto,
    ResourcesDto,
    ServerErrorsItemDto,
    ValidationErrorsItemDto,
} from '../dto/sync-payload.dto.js';

@Processor(QUEUES.SYNC_DATA)
@Injectable()
export class SyncDataIngestionProcessor extends BaseProcessor<
    IngestSyncDataJobData,
    void,
    JOBS.INGEST_SYNC_DATA
> {
    constructor(
        protected readonly logger: AppLoggerService,
        protected readonly cls: ClsService,
        private readonly dataSource: DataSource,
        @Inject(Services.CONSUMERS)
        private readonly consumersService: IConsumersService,
        @Inject(Services.CONSUMER_GROUPS)
        private readonly consumerGroupsService: IConsumerGroupsService,
        @Inject(Services.ENDPOINTS)
        private readonly endpointsService: IEndpointsService,
        @Inject(Services.VALIDATION_ERRORS)
        private readonly validationErrorsService: IValidationErrorsService,
        @Inject(Services.SERVER_ERRORS)
        private readonly serverErrorsService: IServerErrorsService,
        @Inject(Services.TRAFFIC)
        private readonly trafficService: ITrafficService,
        @Inject(Services.RESOURCES)
        private readonly resourcesService: IResourcesService,
    ) {
        super();
        this.logger.setContext(SyncDataIngestionProcessor.name);
    }

    protected async processJob(
        job: Job<IngestSyncDataJobData, void, JOBS.INGEST_SYNC_DATA>,
    ): Promise<void> {
        const { appId, payload } = job.data;

        this.logger.debug('Processing sync payload', {
            appId,
            requests: payload.requests.length,
            consumers: payload.consumers.length,
            serverErrors: payload.serverErrors.length,
            validationErrors: payload.validationErrors.length,
        });

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const timeWindow = new Date(payload.timestamp);
            timeWindow.setSeconds(0, 0);

            const timerSetup = this.startTimer();
            const [consumerMap, endpointMap] = await Promise.all([
                this.processConsumers(queryRunner, appId, payload.consumers),
                this.getEndpointMap(
                    queryRunner,
                    appId,
                    payload.requests,
                    payload.serverErrors,
                    payload.validationErrors,
                ),
            ]);
            this.logger.debug('Setup phase complete', {
                consumers: consumerMap.size,
                endpoints: endpointMap.size,
                duration: timerSetup(),
            });

            const timerProcess = this.startTimer();
            await Promise.all([
                this.processTrafficMetrics(
                    queryRunner,
                    timeWindow,
                    payload.requests,
                    endpointMap,
                    consumerMap,
                ),
                this.processServerErrors(
                    queryRunner,
                    payload.serverErrors,
                    endpointMap,
                    consumerMap,
                ),
                this.processValidationErrors(
                    queryRunner,
                    payload.validationErrors,
                    endpointMap,
                    consumerMap,
                ),
                this.processResourceMetrics(
                    queryRunner,
                    appId,
                    timeWindow,
                    payload.resources,
                ),
            ]);
            this.logger.debug('Process phase complete', {
                duration: timerProcess(),
            });

            await queryRunner.commitTransaction();

            this.logger.log('Transaction committed', {
                appId,
                requests: payload.requests.length,
                serverErrors: payload.serverErrors.length,
                validationErrors: payload.validationErrors.length,
                consumers: consumerMap.size,
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
        consumers: ConsumerInfo[],
    ): Promise<Map<string, number>> {
        if (consumers.length === 0) return new Map();

        const identifiers = consumers.map((c) => c.identifier);
        const existingConsumers =
            await this.consumersService.findAllByIdentifiers(
                appId,
                identifiers,
                queryRunner,
            );
        const consumerMap = new Map<string, number>(
            existingConsumers.map((c) => [c.identifier, c.id]),
        );

        // Resolve groups first — consumers may reference them
        const groupNames = new Set(
            consumers.map((c) => c.group).filter(Boolean) as string[],
        );
        const groupMap = new Map<string, number>();

        if (groupNames.size > 0) {
            const groupNamesArray = Array.from(groupNames);
            const existingGroups =
                await this.consumerGroupsService.findAllByNames(
                    appId,
                    groupNamesArray,
                    queryRunner,
                );
            existingGroups.forEach((g) => groupMap.set(g.name, g.id));

            const missingGroups = groupNamesArray.filter(
                (name) => !groupMap.has(name),
            );
            if (missingGroups.length > 0) {
                const created =
                    await this.consumerGroupsService.createManyConsumerGroups(
                        appId,
                        missingGroups,
                        queryRunner,
                    );
                created.forEach((g) => groupMap.set(g.name, g.id));
            }
        }

        for (const consumerInfo of consumers) {
            const existingId = consumerMap.get(consumerInfo.identifier);
            const groupId = consumerInfo.group
                ? groupMap.get(consumerInfo.group)
                : undefined;

            if (existingId && consumerInfo.name) {
                await this.consumersService.updateConsumer(
                    appId,
                    existingId,
                    { name: consumerInfo.name, consumerGroupId: groupId },
                    queryRunner,
                );
            } else {
                const inserted = await this.consumersService.createConsumers(
                    appId,
                    [
                        {
                            identifier: consumerInfo.identifier,
                            name: consumerInfo.name,
                            groupId,
                            hidden: consumerInfo.hidden,
                        },
                    ],
                    queryRunner,
                );
                consumerMap.set(consumerInfo.identifier, inserted[0].id);
            }
        }

        return consumerMap;
    }

    private async getEndpointMap(
        queryRunner: QueryRunner,
        appId: string,
        requests: RequestsItemDto[],
        serverErrors: ServerErrorsItemDto[],
        validationErrors: ValidationErrorsItemDto[],
    ): Promise<Map<string, string>> {
        const uniquePaths = new Set(
            [...requests, ...serverErrors, ...validationErrors].map(
                (i) => `${i.method}:${i.path}`,
            ),
        );
        if (uniquePaths.size === 0) return new Map();

        const existing = await this.endpointsService.findAllByApp(
            appId,
            queryRunner,
        );
        return new Map(
            existing.map((ep) => [`${ep.method}:${ep.path}`, ep.id]),
        );
    }

    private async processTrafficMetrics(
        queryRunner: QueryRunner,
        timeWindow: Date,
        requests: RequestsItemDto[],
        endpointMap: Map<string, string>,
        consumerMap: Map<string, number>,
    ): Promise<void> {
        for (const request of requests) {
            const endpointId = endpointMap.get(
                `${request.method}:${request.path}`,
            );
            if (!endpointId)
                throw new Error(
                    `Endpoint not found: ${request.method} ${request.path}`,
                );

            const consumerId = request.consumer
                ? consumerMap.get(request.consumer)
                : undefined;
            const percentiles = this.calculatePercentilesFromHistogram(
                request.responseTimes,
            );

            await this.trafficService.upsertTrafficMetrics(
                {
                    requestCount: request.requestCount,
                    requestSizeSum: request.requestSizeSum,
                    responseSizeSum: request.responseSizeSum,
                    responseTimeP50: percentiles.p50,
                    responseTimeP75: percentiles.p75,
                    responseTimeP95: percentiles.p95,
                    timeWindow,
                    endpointId,
                    consumerId,
                },
                queryRunner,
            );
        }
    }

    private async processValidationErrors(
        queryRunner: QueryRunner,
        validationErrors: ValidationErrorsItemDto[],
        endpointMap: Map<string, string>,
        consumerMap: Map<string, number>,
    ): Promise<void> {
        for (const error of validationErrors) {
            const endpointId = endpointMap.get(`${error.method}:${error.path}`);
            if (!endpointId)
                throw new Error(
                    `Endpoint not found: ${error.method} ${error.path}`,
                );

            const consumerId = error.consumer
                ? consumerMap.get(error.consumer)
                : undefined;
            const existing =
                await this.validationErrorsService.getValidationError(
                    {
                        msg: error.msg,
                        type: error.type,
                        loc: error.loc,
                        endpointId,
                    },
                    queryRunner,
                );

            if (existing) {
                await this.validationErrorsService.updateValidationErrorCount(
                    existing.id,
                    error.errorCount,
                    queryRunner,
                );
            } else {
                await this.validationErrorsService.addValidationError(
                    {
                        msg: error.msg,
                        type: error.type,
                        loc: error.loc,
                        errorCount: error.errorCount,
                        endpointId,
                        consumerId,
                    },
                    queryRunner,
                );
            }
        }
    }

    private async processServerErrors(
        queryRunner: QueryRunner,
        serverErrors: ServerErrorsItemDto[],
        endpointMap: Map<string, string>,
        consumerMap: Map<string, number>,
    ): Promise<void> {
        for (const error of serverErrors) {
            const endpointId = endpointMap.get(`${error.method}:${error.path}`);
            if (!endpointId)
                throw new Error(
                    `Endpoint not found: ${error.method} ${error.path}`,
                );

            const consumerId = error.consumer
                ? consumerMap.get(error.consumer)
                : undefined;
            const existing = await this.serverErrorsService.getServerError(
                {
                    msg: error.msg,
                    type: error.type,
                    traceback: error.traceback,
                    endpointId,
                    consumerId,
                },
                queryRunner,
            );

            if (existing) {
                await this.serverErrorsService.updateServerErrorCount(
                    existing.id,
                    error.errorCount,
                    queryRunner,
                );
            } else {
                await this.serverErrorsService.addServerError(
                    {
                        msg: error.msg,
                        type: error.type,
                        traceback: error.traceback,
                        errorCount: error.errorCount,
                        endpointId,
                        consumerId,
                    },
                    queryRunner,
                );
            }
        }
    }

    private async processResourceMetrics(
        queryRunner: QueryRunner,
        appId: string,
        timeWindow: Date,
        resources: ResourcesDto,
    ): Promise<void> {
        await this.resourcesService.upsertResource(
            appId,
            {
                cpuPercent: resources.cpuPercent,
                memoryRss: resources.memoryRss,
                timeWindow,
            },
            queryRunner,
        );
    }

    private calculatePercentilesFromHistogram(
        histogram: Record<number, number>,
    ): { p50: number; p75: number; p95: number } {
        const values = Object.entries(histogram).flatMap(([bucket, count]) =>
            Array.from({ length: count }, () => Number(bucket)),
        );

        if (values.length === 0) return { p50: 0, p75: 0, p95: 0 };

        values.sort((a, b) => a - b);

        const getPercentile = (percentile: number) => {
            const index = Math.ceil((percentile / 100) * values.length) - 1;
            return values[Math.max(0, index)];
        };

        return {
            p50: getPercentile(50),
            p75: getPercentile(75),
            p95: getPercentile(95),
        };
    }
}
