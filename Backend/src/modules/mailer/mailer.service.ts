import fs from 'node:fs/promises';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import Handlebars from 'handlebars';
import type { IMailerService } from './interfaces/mailer-service.interface.js';
import type { Environment } from '../../common/interfaces/env.interface.js';

@Injectable()
export class MailerService implements IMailerService, OnModuleInit {
    private transporter: Transporter;
    private readonly googleOAuth2: OAuth2Client;
    private readonly templateCache = new Map<
        string,
        Handlebars.TemplateDelegate
    >();

    constructor(
        private readonly configService: ConfigService<Environment, true>,
    ) {
        this.googleOAuth2 = new OAuth2Client(
            this.configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
            this.configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
            this.configService.getOrThrow<string>('GOOGLE_REDIRECT_URI'),
        );

        this.googleOAuth2.setCredentials({
            refresh_token: this.configService.getOrThrow<string>(
                'MAILER_REFRESH_TOKEN',
            ),
        });
    }

    async onModuleInit(): Promise<void> {
        await this.initTransporter();
    }

    private async getAccessToken(): Promise<string> {
        const { token } = await this.googleOAuth2.getAccessToken();
        if (!token) throw new Error('Failed to retrieve Google access token.');

        return token;
    }

    private async initTransporter(): Promise<void> {
        try {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
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
                    accessToken: await this.getAccessToken(),
                },
            });
        } catch (error) {
            console.error('Failed to initialize mailer transporter', error);
            throw error;
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

        await this.transporter.sendMail({
            ...options,
            from:
                options.from ??
                `${this.configService.get('MAILER_DEFAULT_NAME', '')} <${this.configService.getOrThrow('MAILER_DEFAULT_EMAIL')}>`,
            html,
        });
    }
}
