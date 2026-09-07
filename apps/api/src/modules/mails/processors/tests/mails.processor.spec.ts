import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import path from 'node:path';
import type { Job } from 'bullmq';
import { MailsProcessor } from '../mails.processor.js';
import { AppLoggerService } from '../../../logger/logger.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { QUEUES, JOBS } from '../../../../common/constants/queue.constant.js';
import type {
    MailsJobData,
    EmailConfirmationJobData,
    PasswordResetJobData,
    TeamInviteJobData,
} from '../../types/mail-job-data.type.js';

describe('MailsProcessor', () => {
    let processor: MailsProcessor;
    let mailerServiceMock: {
        sendMail: jest.Mock<any>;
    };
    let configServiceMock: {
        getOrThrow: jest.Mock<any>;
    };
    let loggerMock: {
        setContext: jest.Mock<any>;
        debug: jest.Mock<any>;
        info: jest.Mock<any>;
        warn: jest.Mock<any>;
        error: jest.Mock<any>;
    };
    let clsMock: {
        runWith: jest.Mock<any>;
        get: jest.Mock<any>;
        set: jest.Mock<any>;
    };

    beforeEach(async () => {
        mailerServiceMock = {
            sendMail: jest.fn<any>(async () => {}),
        };
        configServiceMock = {
            getOrThrow: jest.fn<any>((key: string) => {
                if (key === 'FRONTEND_URL') return 'https://app.hitapi.com';
                if (key === 'APP_NAME') return 'HitAPI';
                return '';
            }),
        };
        loggerMock = {
            setContext: jest.fn<any>(),
            debug: jest.fn<any>(),
            info: jest.fn<any>(),
            warn: jest.fn<any>(),
            error: jest.fn<any>(),
        };
        clsMock = {
            runWith: jest.fn<any>((_store: any, cb: () => any) => cb()),
            get: jest.fn<any>(),
            set: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailsProcessor,
                {
                    provide: Services.MAILER,
                    useValue: mailerServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
            ],
        }).compile();

        processor = module.get<MailsProcessor>(MailsProcessor);
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    describe('EMAIL_CONFIRMATION', () => {
        it('should process job and send email confirmation', async () => {
            const jobMock = {
                id: 'job-1',
                name: JOBS.EMAIL_CONFIRMATION,
                queueName: QUEUES.MAILS,
                attemptsMade: 0,
                opts: { attempts: 5 },
                data: {
                    to: 'user@example.com',
                    displayName: 'John Doe',
                    token: 'verify-token-123',
                    traceId: 'trace-1',
                },
            } as unknown as Job<
                EmailConfirmationJobData,
                void,
                JOBS.EMAIL_CONFIRMATION
            >;

            await processor.process(jobMock);

            expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
                'FRONTEND_URL',
            );
            expect(configServiceMock.getOrThrow).toHaveBeenCalledWith(
                'APP_NAME',
            );
            expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Email Confirmation',
                    text: 'https://app.hitapi.com/verify-email?token=verify-token-123',
                    templatePath: expect.stringContaining(
                        path.join('templates', 'confirm-email.hbs'),
                    ),
                    context: {
                        displayName: 'John Doe',
                        confirmationLink:
                            'https://app.hitapi.com/verify-email?token=verify-token-123',
                        AppName: 'HitAPI',
                    },
                }),
            );
            expect(loggerMock.info).toHaveBeenCalledWith(
                'Job completed',
                expect.any(Object),
            );
        });
    });

    describe('PASSWORD_RESET', () => {
        it('should process job and send password reset email', async () => {
            const jobMock = {
                id: 'job-2',
                name: JOBS.PASSWORD_RESET,
                queueName: QUEUES.MAILS,
                attemptsMade: 0,
                opts: { attempts: 5 },
                data: {
                    to: 'user@example.com',
                    displayName: 'Jane Doe',
                    token: 'reset-token-456',
                    traceId: 'trace-2',
                },
            } as unknown as Job<
                PasswordResetJobData,
                void,
                JOBS.PASSWORD_RESET
            >;

            await processor.process(jobMock);

            expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'user@example.com',
                    subject: 'Password Reset',
                    text: 'https://app.hitapi.com/reset-password?token=reset-token-456',
                    templatePath: expect.stringContaining(
                        path.join('templates', 'reset-password.hbs'),
                    ),
                    context: {
                        displayName: 'Jane Doe',
                        resetLink:
                            'https://app.hitapi.com/reset-password?token=reset-token-456',
                        AppName: 'HitAPI',
                    },
                }),
            );
            expect(loggerMock.info).toHaveBeenCalledWith(
                'Job completed',
                expect.any(Object),
            );
        });
    });

    describe('TEAM_INVITE', () => {
        it('should process job and send team invite email', async () => {
            const jobMock = {
                id: 'job-3',
                name: JOBS.TEAM_INVITE,
                queueName: QUEUES.MAILS,
                attemptsMade: 0,
                opts: { attempts: 5 },
                data: {
                    to: 'invitee@example.com',
                    token: 'invite-token-789',
                    traceId: 'trace-3',
                },
            } as unknown as Job<TeamInviteJobData, void, JOBS.TEAM_INVITE>;

            await processor.process(jobMock);

            expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
                expect.objectContaining({
                    to: 'invitee@example.com',
                    subject: 'Team Invite',
                    text: 'https://app.hitapi.com/team-invite/invite-token-789',
                    templatePath: expect.stringContaining(
                        path.join('templates', 'team-invite.hbs'),
                    ),
                    context: {
                        inviteLink:
                            'https://app.hitapi.com/team-invite/invite-token-789',
                        AppName: 'HitAPI',
                    },
                }),
            );
            expect(loggerMock.info).toHaveBeenCalledWith(
                'Job completed',
                expect.any(Object),
            );
        });
    });

    describe('unknown job name', () => {
        it('should log warning for unknown job name', async () => {
            const jobMock = {
                id: 'job-4',
                name: 'unknown-job',
                queueName: QUEUES.MAILS,
                attemptsMade: 0,
                opts: { attempts: 5 },
                data: {
                    to: 'test@example.com',
                },
            } as unknown as Job<MailsJobData, void, JOBS>;

            await processor.process(jobMock);

            expect(loggerMock.warn).toHaveBeenCalledWith(
                'Unknown mail job: unknown-job',
            );
            expect(mailerServiceMock.sendMail).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should log error and rethrow when sendMail fails', async () => {
            mailerServiceMock.sendMail.mockRejectedValueOnce(
                new Error('SMTP connection timed out'),
            );

            const jobMock = {
                id: 'job-5',
                name: JOBS.EMAIL_CONFIRMATION,
                queueName: QUEUES.MAILS,
                attemptsMade: 0,
                opts: { attempts: 5 },
                data: {
                    to: 'user@example.com',
                    displayName: 'John Doe',
                    token: 'verify-token-123',
                    traceId: 'trace-1',
                },
            } as unknown as Job<
                EmailConfirmationJobData,
                void,
                JOBS.EMAIL_CONFIRMATION
            >;

            await expect(processor.process(jobMock)).rejects.toThrow(
                'SMTP connection timed out',
            );

            expect(loggerMock.error).toHaveBeenCalledWith(
                'Job failed',
                expect.objectContaining({
                    attempt: 1,
                    maxAttempts: 5,
                    willRetry: true,
                }),
            );
        });
    });
});
