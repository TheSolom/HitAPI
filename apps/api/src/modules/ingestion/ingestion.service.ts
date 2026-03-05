import { Injectable } from '@nestjs/common';
import { InjectFlowProducer } from '@nestjs/bullmq';
import { FlowProducer } from 'bullmq';
import type { UserApp, RequestLogItem } from '@hitapi/types';
import type { IIngestionService } from './interfaces/ingestion-service.interface.js';
import {
    FLOW_PRODUCERS,
    QUEUES,
    JOBS,
} from '../../common/constants/queue.constant.js';

@Injectable()
export class IngestionService implements IIngestionService {
    constructor(
        @InjectFlowProducer(FLOW_PRODUCERS.LOGS_INGESTION)
        private readonly logsFlowProducer: FlowProducer,
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
}
