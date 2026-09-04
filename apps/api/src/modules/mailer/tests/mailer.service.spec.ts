import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import fs from 'node:fs/promises';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import { MailerService } from '../mailer.service.js';
import { AppLoggerService } from '../../logger/logger.service.js';

describe('MailerService', () => {
    let service: MailerService;
    let loggerMock: {
        setContext: jest.Mock;
        error: jest.Mock;
    };
    let configServiceMock: {
        getOrThrow: jest.Mock<any>;
        get: jest.Mock<any>;
    };
    let sendMailMock: jest.Mock<any>;

    beforeEach(async () => {
        loggerMock = {
            setContext: jest.fn(),
            error: jest.fn(),
        };

        configServiceMock = {
            getOrThrow: jest.fn((key: string) => {
                switch (key) {
                    case 'GOOGLE_CLIENT_ID':
                        return 'mock-google-client-id';
                    case 'GOOGLE_CLIENT_SECRET':
                        return 'mock-google-client-secret';
                    case 'GOOGLE_REDIRECT_URI':
                        return 'https://developers.google.com/oauthplayground';
                    case 'MAILER_REFRESH_TOKEN':
                        return 'mock-refresh-token';
                    case 'MAILER_USER':
                        return 'test@example.com';
                    case 'MAILER_DEFAULT_EMAIL':
                        return 'noreply@hitapi.com';
                    default:
                        return 'mock-value';
                }
            }),
            get: jest.fn((key: string, defaultValue?: unknown) => {
                if (key === 'MAILER_DEFAULT_NAME') return 'HitAPI Team';
                return defaultValue;
            }),
        };

        sendMailMock = jest.fn(async () => ({}));
        jest.spyOn(OAuth2Client.prototype, 'getAccessToken').mockResolvedValue({
            token: 'mock-access-token',
            res: null,
        } as never);
        jest.spyOn(OAuth2Client.prototype, 'setCredentials').mockImplementation(
            () => {},
        );

        jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
            sendMail: sendMailMock,
        } as unknown as nodemailer.Transporter);

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailerService,
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        service = module.get<MailerService>(MailerService);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('onModuleInit', () => {
        it('should initialize the nodemailer transporter', async () => {
            await service.onModuleInit();
            expect(nodemailer.createTransport).toHaveBeenCalledWith(
                expect.objectContaining({
                    service: 'gmail',
                    auth: expect.objectContaining({
                        type: 'OAuth2',
                        user: 'test@example.com',
                        clientId: 'mock-google-client-id',
                        clientSecret: 'mock-google-client-secret',
                        refreshToken: 'mock-refresh-token',
                        accessToken: 'mock-access-token',
                    }),
                }),
            );
        });

        it('should log error when transporter initialization fails', async () => {
            jest.spyOn(
                OAuth2Client.prototype,
                'getAccessToken',
            ).mockResolvedValueOnce({
                token: null,
                res: null,
            } as never);

            await service.onModuleInit();
            expect(loggerMock.error).toHaveBeenCalledWith(
                'Failed to initialize mailer transporter',
                expect.any(Object),
            );
        });
    });

    describe('sendMail', () => {
        it('should throw error if transporter is not initialized', async () => {
            await expect(
                service.sendMail({
                    to: 'recipient@example.com',
                    subject: 'Test Subject',
                }),
            ).rejects.toThrow('Transporter not initialized.');
        });

        it('should send email without template correctly', async () => {
            await service.onModuleInit();

            await service.sendMail({
                to: 'recipient@example.com',
                subject: 'Test Subject',
                html: '<p>Hello World</p>',
            });

            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'recipient@example.com',
                    subject: 'Test Subject',
                    from: 'HitAPI Team <noreply@hitapi.com>',
                    html: '<p>Hello World</p>',
                }),
            );
        });

        it('should render template and cache it when templatePath is provided', async () => {
            await service.onModuleInit();

            jest.spyOn(fs, 'readFile').mockResolvedValue(
                '<h1>Hello {{name}}! Welcome to {{AppName}}</h1>',
            );

            await service.sendMail({
                to: 'recipient@example.com',
                subject: 'Welcome',
                templatePath: '/mock/path/welcome.hbs',
                context: { name: 'Alice', AppName: 'HitAPI' },
            });

            expect(fs.readFile).toHaveBeenCalledWith(
                '/mock/path/welcome.hbs',
                'utf-8',
            );
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'recipient@example.com',
                    html: '<h1>Hello Alice! Welcome to HitAPI</h1>',
                }),
            );

            // Calling again with same template path should use cache (readFile not called again)
            await service.sendMail({
                to: 'recipient2@example.com',
                subject: 'Welcome 2',
                templatePath: '/mock/path/welcome.hbs',
                context: { name: 'Bob', AppName: 'HitAPI' },
            });

            expect(fs.readFile).toHaveBeenCalledTimes(1);
            expect(sendMailMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'recipient2@example.com',
                    html: '<h1>Hello Bob! Welcome to HitAPI</h1>',
                }),
            );
        });
    });
});
