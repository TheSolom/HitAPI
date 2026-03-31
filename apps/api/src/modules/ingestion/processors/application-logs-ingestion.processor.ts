import { Processor } from '@nestjs/bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { BaseProcessor } from '../../../common/queues/base.processor.js';
import { AppLoggerService } from '../../logger/logger.service.js';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IApplicationLogsService } from '../../request-logs/interfaces/application-logs-service.interface.js';
import type { IngestApplicationLogsJobData } from '../types/job-data.type.js';
import type { LogRecordDto } from '../dto/request-log-item.dto.js';

@Processor(QUEUES.APPLICATION_LOGS)
@Injectable()
export class ApplicationLogsIngestionProcessor extends BaseProcessor<
    IngestApplicationLogsJobData,
    void,
    JOBS.INGEST_APPLICATION_LOGS
> {
    constructor(
        @Inject(Services.APPLICATION_LOGS)
        private readonly applicationLogsService: IApplicationLogsService,
        protected readonly logger: AppLoggerService,
        protected readonly cls: ClsService,
    ) {
        super();
        this.logger.setContext(ApplicationLogsIngestionProcessor.name);
    }

    protected async processJob(
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

        if (logs.length === 0) {
            this.logger.debug('Empty log batch, skipping insert');
            return;
        }

        this.logger.debug('Inserting application logs', { count: logs.length });

        await this.applicationLogsService.createApplicationLogs(logs);
    }
}
