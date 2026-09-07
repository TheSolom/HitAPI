import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ClsService } from 'nestjs-cls';
import { QUEUES, JOBS } from '../../common/constants/queue.constant.js';
import type { IMailsService } from './interfaces/mails-service.interface.js';
import type { MailData } from './types/mails.type.js';
import type {
    EmailConfirmationJobData,
    PasswordResetJobData,
    TeamInviteJobData,
} from './types/mail-job-data.type.js';

@Injectable()
export class MailsService implements IMailsService {
    constructor(
        @InjectQueue(QUEUES.MAILS)
        private readonly mailsQueue: Queue,
        private readonly cls: ClsService,
    ) {}

    async emailConfirmation(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void> {
        await this.mailsQueue.add(JOBS.EMAIL_CONFIRMATION, {
            to: mailData.to,
            token: mailData.data.token,
            displayName: mailData.data.displayName,
            traceId: this.cls.get('traceId'),
        } satisfies EmailConfirmationJobData);
    }

    async passwordReset(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void> {
        await this.mailsQueue.add(JOBS.PASSWORD_RESET, {
            to: mailData.to,
            token: mailData.data.token,
            displayName: mailData.data.displayName,
            traceId: this.cls.get('traceId'),
        } satisfies PasswordResetJobData);
    }

    async teamInvite(mailData: MailData<{ token: string }>): Promise<void> {
        await this.mailsQueue.add(JOBS.TEAM_INVITE, {
            to: mailData.to,
            token: mailData.data.token,
            traceId: this.cls.get('traceId'),
        } satisfies TeamInviteJobData);
    }
}
