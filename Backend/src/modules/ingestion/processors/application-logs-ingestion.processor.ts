import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Inject, Logger } from '@nestjs/common';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IApplicationLogsService } from '../../request-logs/interfaces/application-logs-service.interface.js';
import type { IngestApplicationLogsJobData } from '../types/job-data.type.js';

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
        await this.applicationLogsService.createApplicationLogs(job.data.logs);
    }
}
