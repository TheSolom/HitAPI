import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { MailerModule } from '../mailer/mailer.module.js';
import { MailsService } from './mails.service.js';
import { MailsProcessor } from './processors/mails.processor.js';
import { Services } from '../../common/constants/services.constant.js';
import { QUEUES } from '../../common/constants/queue.constant.js';

@Module({
    imports: [
        MailerModule,
        BullModule.registerQueue({
            name: QUEUES.MAILS,
            defaultJobOptions: {
                attempts: 5,
                backoff: { type: 'exponential', delay: 3000 },
                removeOnComplete: true,
                removeOnFail: false,
            },
        }),
        BullBoardModule.forFeature({
            name: QUEUES.MAILS,
            adapter: BullMQAdapter,
        }),
    ],
    providers: [
        {
            provide: Services.MAILS,
            useClass: MailsService,
        },
        MailsProcessor,
    ],
    exports: [Services.MAILS],
})
export class MailsModule {}
