import path from 'node:path';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Services } from '../../common/constants/services.constant.js';
import type { IMailerService } from '../mailer/interfaces/mailer-service.interface.js';
import type { IMailsService } from './interfaces/mails-service.interface.js';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import type { MailData } from './types/mails.type.js';

@Injectable()
export class MailsService implements IMailsService {
    constructor(
        @Inject(Services.MAILER) private readonly mailerService: IMailerService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
    ) {}

    async emailConfirmation(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void> {
        await this.mailerService.sendMail({
            to: mailData.to,
            subject: 'Email Confirmation',
            text: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/confirm-email/${mailData.data.token}`,
            templatePath: path.join(
                process.cwd(),
                'src',
                'modules',
                'mails',
                'templates',
                'confirm-email.hbs',
            ),
            context: {
                displayName: mailData.data.displayName,
                confirmationLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/confirm-email/${mailData.data.token}`,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }

    async passwordReset(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void> {
        await this.mailerService.sendMail({
            to: mailData.to,
            subject: 'Password Reset',
            text: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/password-change/${mailData.data.token}`,
            templatePath: path.join(
                process.cwd(),
                'src',
                'modules',
                'mails',
                'templates',
                'reset-password.hbs',
            ),
            context: {
                displayName: mailData.data.displayName,
                resetLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/password-change/${mailData.data.token}`,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }

    async teamInvite(mailData: MailData<{ token: string }>): Promise<void> {
        await this.mailerService.sendMail({
            to: mailData.to,
            subject: 'Team Invite',
            text: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/team-invite/${mailData.data.token}`,
            templatePath: path.join(
                process.cwd(),
                'src',
                'modules',
                'mails',
                'templates',
                'team-invite.hbs',
            ),
            context: {
                inviteLink: `${this.configService.getOrThrow<string>('FRONTEND_URL')}/team-invite/${mailData.data.token}`,
                AppName: this.configService.getOrThrow<string>('APP_NAME'),
            },
        });
    }
}
