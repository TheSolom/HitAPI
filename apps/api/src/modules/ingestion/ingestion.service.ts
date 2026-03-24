import { Injectable, Inject } from '@nestjs/common';
import { InjectFlowProducer, InjectQueue } from '@nestjs/bullmq';
import { FlowProducer, Queue } from 'bullmq';
import type {
    UserApp,
    RequestLogItem,
    StartupPayload,
    SyncPayload,
} from '@hitapi/types';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
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
        @InjectFlowProducer(FLOW_PRODUCERS.LOGS_INGESTION)
        private readonly logsFlowProducer: FlowProducer,
        @InjectQueue(QUEUES.SYNC_DATA)
        private readonly syncDataQueue: Queue,
        @Inject(Services.ENDPOINTS)
        private readonly endpointsService: IEndpointsService,
    ) {}

    async ingestRequestLogs(
        app: UserApp,
        fileUuid: string,
        items: RequestLogItem[],
    ): Promise<void> {
        await this.logsFlowProducer.add({
            name: JOBS.INGEST_APPLICATION_LOGS,
            queueName: QUEUES.APPLICATION_LOGS,
            data: {
                fileUuid,
                items,
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
        let created = 0,
            updated = 0,
            removed = 0;

        const existingEndpoints = await this.endpointsService.findAllByApp(
            app.id,
        );

        const existingMap = new Map<string, Endpoint>();
        existingEndpoints.forEach((ep) => {
            const key = `${ep.method}:${ep.path}`;
            existingMap.set(key, ep);
        });

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
        await this.syncDataQueue.add(JOBS.INGEST_SYNC_DATA, {
            appId: app.id,
            payload: syncPayload,
        });
    }
}
