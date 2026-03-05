import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IApplicationLogsService } from '../../request-logs/interfaces/application-logs-service.interface.js';
import type { IngestApplicationLogsJobData } from '../types/job-data.type.js';
import type { LogRecordDto } from '../dto/request-log-item.dto.js';

@Processor(QUEUES.APPLICATION_LOGS)
@Injectable()
export class ApplicationLogsIngestionProcessor extends WorkerHost {
    private readonly logger = new Logger(
        ApplicationLogsIngestionProcessor.name,
    );

    constructor(
        @Inject(Services.APPLICATION_LOGS)
        private readonly applicationLogsService: IApplicationLogsService,
    ) {
        super();
    }

    async process(
        job: Job<
            IngestApplicationLogsJobData,
            void,
            JOBS.INGEST_APPLICATION_LOGS
        >,
    ): Promise<void> {
        const logs = job.data.items.flatMap(
            (item) =>
                item.logs?.map((log: LogRecordDto) => ({
                    requestUuid: item.uuid,
                    message: log.message,
                    level: log.level,
                    logger: log.logger,
                    timestamp: new Date(log.timestamp),
                })) ?? [],
        );
        if (logs.length === 0) return;

        try {
            await this.applicationLogsService.createApplicationLogs(logs);

            this.logger.log(
                `Successfully processed ${logs.length} application logs`,
            );
        } catch (error) {
            if (error instanceof Error) {
                this.logger.error(
                    `Failed to process application logs: ${error.message}`,
                    error.stack,
                );
            } else {
                this.logger.error(
                    `Failed to process application logs: ${error}`,
                );
            }
            throw error;
        }
    }
}
