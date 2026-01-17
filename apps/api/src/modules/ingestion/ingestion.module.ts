import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { ConsumersModule } from '../consumers/consumers.module.js';
import { GeoIPModule } from '../geo-ip/geo-ip.module.js';
import { AppsModule } from '../apps/apps.module.js';
import { QUEUES } from '../../common/constants/queue.constant.js';
import { IngestionController } from './ingestion.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { IngestionService } from './ingestion.service.js';
import { RequestLogIngestionProcessor } from './processors/request-log-ingestion.processor.js';
import { ApplicationLogsIngestionProcessor } from './processors/application-logs-ingestion.processor.js';

@Module({
    imports: [
        RequestLogsModule,
        ConsumersModule,
        GeoIPModule,
        AppsModule,
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
        ),
        BullBoardModule.forFeature(
            {
                name: QUEUES.REQUEST_LOGS,
                adapter: BullMQAdapter,
            },
            {
                name: QUEUES.APPLICATION_LOGS,
                adapter: BullMQAdapter,
            },
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
    ],
})
export class IngestionModule {}
