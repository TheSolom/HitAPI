import fs from 'node:fs/promises';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import Handlebars from 'handlebars';
import type { IMailerService } from './interfaces/mailer-service.interface.js';
import { AppLoggerService } from '../logger/logger.service.js';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';

@Injectable()
export class MailerService implements IMailerService, OnModuleInit {
    private transporter?: Transporter;
    private readonly templateCache = new Map<
        string,
        Handlebars.TemplateDelegate
    >();

    constructor(
        private readonly logger: AppLoggerService,
        private readonly configService: ConfigService<
            EnvironmentVariablesDto,
            true
        >,
    ) {
        this.logger.setContext(MailerService.name);
    }

    onModuleInit(): void {
        this.initTransporter();
    }

    private initTransporter(): void {
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                secure: true,
                auth: {
                    type: 'OAuth2',
                    user: this.configService.getOrThrow<string>('MAILER_USER'),
                    clientId:
                        this.configService.getOrThrow<string>(
                            'GOOGLE_CLIENT_ID',
                        ),
                    clientSecret: this.configService.getOrThrow<string>(
                        'GOOGLE_CLIENT_SECRET',
                    ),
                    refreshToken: this.configService.getOrThrow<string>(
                        'MAILER_REFRESH_TOKEN',
                    ),
                },
            });
        } catch (error) {
            this.logger.error('Failed to initialize mailer transporter', {
                error:
                    error instanceof Error
                        ? error.stack
                        : JSON.stringify(error),
            });
        }
    }

    private async renderTemplate(
        path: string,
        context: Record<string, unknown>,
    ): Promise<string> {
        let compiled = this.templateCache.get(path);

        if (!compiled) {
            const templateSource = await fs.readFile(path, 'utf-8');
            compiled = Handlebars.compile(templateSource);
            this.templateCache.set(path, compiled);
        }

        return compiled(context);
    }

    async sendMail(
        options: SendMailOptions & {
            templatePath?: string;
            context?: Record<string, unknown>;
        },
    ): Promise<void> {
        if (!this.transporter) {
            throw new Error('Transporter not initialized.');
        }

        let html = options.html;
        if (options.templatePath) {
            html = await this.renderTemplate(
                options.templatePath,
                options.context ?? {},
            );
        }

        try {
            await this.transporter.sendMail({
                ...options,
                from:
                    options.from ??
                    `${this.configService.get<string>('MAILER_DEFAULT_NAME', '')} <${this.configService.getOrThrow<string>('MAILER_DEFAULT_EMAIL')}>`,
                html,
            });
        } catch (error) {
            this.logger.error('Failed to send email', {
                to: options.to,
                subject: options.subject,
                error:
                    error instanceof Error
                        ? error.stack
                        : JSON.stringify(error),
            });
            throw error;
        }
    }
}
