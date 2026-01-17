import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
import { QUEUES, JOBS } from '../../common/constants/queue.constant.js';
import type { App } from '../apps/entities/app.entity.js';
import { IngestRequestLogsDto } from './dto/ingest-request-logs.dto.js';
import { IngestApplicationLogsDto } from './dto/ingest-application-logs.dto.js';

@Injectable()
export class IngestionService implements IIngestionService {
    private readonly logger = new Logger(IngestionService.name);

    constructor(
        @InjectQueue(QUEUES.REQUEST_LOGS)
        private readonly requestLogsQueue: Queue,
        @InjectQueue(QUEUES.APPLICATION_LOGS)
        private readonly applicationLogsQueue: Queue,
    ) {}

    async ingestRequestLogs(
        requestLogs: IngestRequestLogsDto,
        app: App,
    ): Promise<void> {
        await this.requestLogsQueue.add(JOBS.INGEST_REQUEST_LOGS, {
            appId: app.id,
            requests: requestLogs.requests,
            timestamp: new Date(),
        });
    }

    async ingestApplicationLogs(
        applicationLogs: IngestApplicationLogsDto,
        app: App,
    ): Promise<void> {
        await this.applicationLogsQueue.add(JOBS.INGEST_APPLICATION_LOGS, {
            appId: app.id,
            logs: applicationLogs.logs,
            timestamp: new Date(),
        });
    }
}
