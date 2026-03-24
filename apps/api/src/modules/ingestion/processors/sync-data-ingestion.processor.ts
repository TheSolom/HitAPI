import { Processor, WorkerHost } from '@nestjs/bullmq';
import { DataSource, type QueryRunner } from 'typeorm';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import type { ConsumerInfo } from '@hitapi/types';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from './../../../common/constants/services.constant.js';
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
export class SyncDataIngestionProcessor extends WorkerHost {
    private readonly logger = new Logger(SyncDataIngestionProcessor.name);

    constructor(
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
    }

    async process(
        job: Job<IngestSyncDataJobData, void, JOBS.INGEST_SYNC_DATA>,
    ): Promise<void> {
        const { appId, payload } = job.data;

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const timeWindow = new Date(payload.timestamp);
            timeWindow.setSeconds(0, 0);

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

            await queryRunner.commitTransaction();

            this.logger.log(`Sync completed for app ${appId}`);
        } catch (error) {
            await queryRunner.rollbackTransaction();
            if (error instanceof Error) {
                this.logger.error(`Sync failed: ${error.message}`, error.stack);
            } else {
                this.logger.error(`Sync failed: ${error}`);
            }
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
        if (consumers.length === 0) return new Map<string, number>();

        const identifiers = consumers.map((c) => c.identifier);
        const existingConsumers =
            await this.consumersService.findAllByIdentifiers(
                appId,
                identifiers,
                queryRunner,
            );

        const consumerMap = new Map<string, number>();
        existingConsumers.forEach((c) => consumerMap.set(c.identifier, c.id));

        const groupNames = new Set<string>();
        for (const c of consumers) {
            if (c.group) groupNames.add(c.group);
        }

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
                const createdGroups =
                    await this.consumerGroupsService.createManyConsumerGroups(
                        appId,
                        missingGroups,
                        queryRunner,
                    );
                createdGroups.forEach((g) => groupMap.set(g.name, g.id));
            }
        }

        for (const consumerInfo of consumers) {
            const existingConsumerId = consumerMap.get(consumerInfo.identifier);
            const groupId = consumerInfo.group
                ? groupMap.get(consumerInfo.group)
                : undefined;

            if (existingConsumerId && consumerInfo.name) {
                await this.consumersService.updateConsumer(
                    appId,
                    existingConsumerId,
                    {
                        name: consumerInfo.name,
                        consumerGroupId: groupId,
                    },
                    queryRunner,
                );
            } else {
                const insertResult =
                    await this.consumersService.createConsumers(
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

                consumerMap.set(consumerInfo.identifier, insertResult[0].id);
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
        // Collect unique method:path combinations
        const uniquePaths = new Set<string>();

        for (const item of [
            ...requests,
            ...serverErrors,
            ...validationErrors,
        ]) {
            uniquePaths.add(`${item.method}:${item.path}`);
        }

        if (uniquePaths.size === 0) return new Map<string, string>();

        const existingEndpoints = await this.endpointsService.findAllByApp(
            appId,
            queryRunner,
        );

        return existingEndpoints.reduce((map, endpoint) => {
            map.set(`${endpoint.method}:${endpoint.path}`, endpoint.id);
            return map;
        }, new Map<string, string>());
    }

    private calculatePercentilesFromHistogram(
        histogram: Record<number, number>,
    ): { p50: number; p75: number; p95: number } {
        const values: number[] = [];
        Object.entries(histogram).forEach(([bucket, count]) => {
            const value = Number.parseInt(bucket);
            for (let i = 0; i < count; i++) values.push(value);
        });

        if (values.length === 0) return { p50: 0, p75: 0, p95: 0 };

        values.sort((a, b) => a - b);

        const getPercentile = (p: number) => {
            const index = Math.ceil((p / 100) * values.length) - 1;
            return values[Math.max(0, index)];
        };

        return {
            p50: getPercentile(50),
            p75: getPercentile(75),
            p95: getPercentile(95),
        };
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
            if (!endpointId) throw new Error('Endpoint not found');

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
            if (!endpointId) throw new Error('Endpoint not found');

            const consumerId = error.consumer
                ? consumerMap.get(error.consumer)
                : undefined;

            const existingValidationError =
                await this.validationErrorsService.getValidationError(
                    {
                        msg: error.msg,
                        type: error.type,
                        loc: error.loc,
                        endpointId,
                    },
                    queryRunner,
                );

            if (existingValidationError) {
                await this.validationErrorsService.updateValidationErrorCount(
                    existingValidationError.id,
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
            if (!endpointId) throw new Error('Endpoint not found');

            const consumerId = error.consumer
                ? consumerMap.get(error.consumer)
                : undefined;

            const existingServerError =
                await this.serverErrorsService.getServerError(
                    {
                        msg: error.msg,
                        type: error.type,
                        traceback: error.traceback,
                        endpointId,
                        consumerId,
                    },
                    queryRunner,
                );

            if (existingServerError) {
                await this.serverErrorsService.updateServerErrorCount(
                    existingServerError.id,
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
}
