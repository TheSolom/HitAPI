import { Injectable, Inject } from '@nestjs/common';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import type {
    UserApp,
    RequestLogItem,
    StartupPayload,
    SyncPayload,
} from '@hitapi/types';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
import { AppLoggerService } from '../logger/logger.service.js';
import {
    FLOW_PRODUCERS,
    QUEUES,
    JOBS,
} from '../../common/constants/queue.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IEndpointsService } from '../endpoints/interfaces/endpoints-service.interface.js';
import { Endpoint } from '../endpoints/entities/endpoint.entity.js';
import type { StartupResponseDto } from './dto/startup-response.dto.js';

@Injectable()
export class IngestionService implements IIngestionService {
    constructor(
        private readonly logger: AppLoggerService,
        private readonly cls: ClsService,
        @InjectFlowProducer(FLOW_PRODUCERS.LOGS_INGESTION)
        private readonly logsFlowProducer: FlowProducer,
        @InjectQueue(QUEUES.SYNC_DATA)
        private readonly syncDataQueue: Queue,
        @Inject(Services.ENDPOINTS)
        private readonly endpointsService: IEndpointsService,
    ) {
        this.logger.setContext(IngestionService.name);
    }

    async ingestRequestLogs(
        app: UserApp,
        fileUuid: string,
        items: RequestLogItem[],
    ): Promise<void> {
        const traceId = this.cls.get<string>('traceId');

        this.logger.debug('Enqueuing request log flow', {
            fileUuid,
            items: items.length,
            appId: app.id,
            traceId,
        });

        await this.logsFlowProducer.add({
            name: JOBS.INGEST_APPLICATION_LOGS,
            queueName: QUEUES.APPLICATION_LOGS,
            data: {
                appId: app.id,
                fileUuid,
                items,
                traceId,
            },
            opts: { jobId: fileUuid },
            children: [
                {
                    name: JOBS.INGEST_REQUEST_LOGS,
                    queueName: QUEUES.REQUEST_LOGS,
                    data: {
                        appId: app.id,
                        fileUuid,
                        items,
                        traceId,
                    },
                    opts: { jobId: fileUuid },
                },
            ],
        });
    }

    async ingestStartupData(
        app: UserApp,
        startupPayload: StartupPayload,
    ): Promise<StartupResponseDto> {
        const startTime = Date.now();
        let created = 0,
            updated = 0,
            removed = 0;

        const existingEndpoints = await this.endpointsService.findAllByApp(
            app.id,
        );

        const existingMap = new Map<string, Endpoint>(
            existingEndpoints.map((ep) => [`${ep.method}:${ep.path}`, ep]),
        );

        const incomingKeys = new Set<string>();

        for (const pathInfo of startupPayload.paths) {
            const key = `${pathInfo.method}:${pathInfo.path}`;
            incomingKeys.add(key);

            const existing = existingMap.get(key);
            if (existing) {
                await this.endpointsService.restore(app.id, existing.id);
                updated++;
            } else {
                await this.endpointsService.create(app.id, {
                    method: pathInfo.method,
                    path: pathInfo.path,
                });
                created++;
            }
        }

        for (const [key, endpoint] of existingMap.entries()) {
            if (!incomingKeys.has(key) && !endpoint.deletedAt) {
                await this.endpointsService.remove(app.id, endpoint.id);
                removed++;
            }
        }

        this.logger.log('Startup data processed', {
            appId: app.id,
            created,
            updated,
            removed,
            total: startupPayload.paths.length,
            duration: Date.now() - startTime,
        });

        return {
            created,
            updated,
            removed,
            total: startupPayload.paths.length,
        };
    }

    async ingestSyncData(
        app: UserApp,
        syncPayload: SyncPayload,
    ): Promise<void> {
        const traceId = this.cls.get<string>('traceId');

        this.logger.debug('Enqueuing sync data job', {
            appId: app.id,
            messageUuid: syncPayload.messageUuid,
            traceId,
        });

        await this.syncDataQueue.add(JOBS.INGEST_SYNC_DATA, {
            appId: app.id,
            payload: syncPayload,
            traceId,
        });
    }
}
