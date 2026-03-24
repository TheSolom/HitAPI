import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { ConsumersModule } from '../consumers/consumers.module.js';
import { GeoIPModule } from '../geo-ip/geo-ip.module.js';
import { AppsModule } from '../apps/apps.module.js';
import { EndpointsModule } from '../endpoints/endpoints.module.js';
import { ErrorsModule } from '../errors/errors.module.js';
import { TrafficModule } from '../traffic/traffic.module.js';
import { ResourcesModule } from '../resources/resources.module.js';
import {
    QUEUES,
    FLOW_PRODUCERS,
} from '../../common/constants/queue.constant.js';
import { IngestionController } from './ingestion.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { IngestionService } from './ingestion.service.js';
import { RequestLogIngestionProcessor } from './processors/request-log-ingestion.processor.js';
import { ApplicationLogsIngestionProcessor } from './processors/application-logs-ingestion.processor.js';
import { SyncDataIngestionProcessor } from './processors/sync-data-ingestion.processor.js';

@Module({
    imports: [
        RequestLogsModule,
        ConsumersModule,
        GeoIPModule,
        AppsModule,
        EndpointsModule,
        ErrorsModule,
        TrafficModule,
        ResourcesModule,
        BullModule.registerQueue(
            {
                name: QUEUES.REQUEST_LOGS,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            },
            {
                name: QUEUES.APPLICATION_LOGS,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            },
            {
                name: QUEUES.SYNC_DATA,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 2000 },
                    removeOnComplete: true,
                    removeOnFail: false,
                },
            },
        ),
        BullModule.registerFlowProducer({
            name: FLOW_PRODUCERS.LOGS_INGESTION,
        }),
        BullBoardModule.forFeature(
            { name: QUEUES.REQUEST_LOGS, adapter: BullMQAdapter },
            { name: QUEUES.APPLICATION_LOGS, adapter: BullMQAdapter },
            { name: QUEUES.SYNC_DATA, adapter: BullMQAdapter },
        ),
    ],
    controllers: [IngestionController],
    providers: [
        {
            provide: Services.INGESTION,
            useClass: IngestionService,
        },
        RequestLogIngestionProcessor,
        ApplicationLogsIngestionProcessor,
        SyncDataIngestionProcessor,
    ],
})
export class IngestionModule {}
