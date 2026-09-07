import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Processor } from '@nestjs/bullmq';
import { Injectable, Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { BaseProcessor } from '../../../common/queues/base.processor.js';
import { AppLoggerService } from '../../logger/logger.service.js';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IMailerService } from '../../mailer/interfaces/mailer-service.interface.js';
import type { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';
import type {
    MailsJobData,
    EmailConfirmationJobData,
    PasswordResetJobData,
    TeamInviteJobData,
} from '../types/mail-job-data.type.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

@Processor(QUEUES.MAILS)
@Injectable()
export class MailsProcessor extends BaseProcessor<MailsJobData, void, JOBS> {
    constructor(
        @Inject(Services.MAILER) private readonly mailerService: IMailerService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
        protected readonly logger: AppLoggerService,
        protected readonly cls: ClsService,
    ) {
        super();
        this.logger.setContext(MailsProcessor.name);
    }

    protected async processJob(
        job: Job<MailsJobData, void, JOBS>,
    ): Promise<void> {
        switch (job.name) {
            case JOBS.EMAIL_CONFIRMATION:
                await this.sendEmailConfirmation(
                    job as Job<
                        EmailConfirmationJobData,
                        void,
                        JOBS.EMAIL_CONFIRMATION
                    >,
                );
                break;
            case JOBS.PASSWORD_RESET:
                await this.sendPasswordReset(
                    job as Job<PasswordResetJobData, void, JOBS.PASSWORD_RESET>,
                );
                break;
            case JOBS.TEAM_INVITE:
                await this.sendTeamInvite(
                    job as Job<TeamInviteJobData, void, JOBS.TEAM_INVITE>,
                );
                break;
            default:
                this.logger.warn(`Unknown mail job: ${job.name}`);
        }
    }

    private async sendEmailConfirmation(
        job: Job<EmailConfirmationJobData, void, JOBS.EMAIL_CONFIRMATION>,
    ): Promise<void> {
        const { to, displayName, token } = job.data;
        const frontendUrl =
            this.configService.getOrThrow<string>('FRONTEND_URL');
        const verificationLink = `${frontendUrl}/verify-email?token=${token}`;

        await this.mailerService.sendMail({
            to,
            subject: 'Email Confirmation',
            text: verificationLink,
            templatePath: path.join(
                __dirname,
                '..',
                'templates',
                'confirm-email.hbs',
            ),
            context: {
                displayName,
                confirmationLink: verificationLink,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }

    private async sendPasswordReset(
        job: Job<PasswordResetJobData, void, JOBS.PASSWORD_RESET>,
    ): Promise<void> {
        const { to, displayName, token } = job.data;
        const frontendUrl =
            this.configService.getOrThrow<string>('FRONTEND_URL');
        const resetLink = `${frontendUrl}/reset-password?token=${token}`;

        await this.mailerService.sendMail({
            to,
            subject: 'Password Reset',
            text: resetLink,
            templatePath: path.join(
                __dirname,
                '..',
                'templates',
                'reset-password.hbs',
            ),
            context: {
                displayName,
                resetLink,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }

    private async sendTeamInvite(
        job: Job<TeamInviteJobData, void, JOBS.TEAM_INVITE>,
    ): Promise<void> {
        const { to, token } = job.data;
        const frontendUrl =
            this.configService.getOrThrow<string>('FRONTEND_URL');
        const inviteLink = `${frontendUrl}/team-invite/${token}`;

        await this.mailerService.sendMail({
            to,
            subject: 'Team Invite',
            text: inviteLink,
            templatePath: path.join(
                __dirname,
                '..',
                'templates',
                'team-invite.hbs',
            ),
            context: {
                inviteLink,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }
}
