import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import path from 'node:path';
import { MailsService } from '../mails.service.js';
import { Services } from '../../../common/constants/services.constant.js';

describe('MailsService', () => {
    let service: MailsService;
    let mailerServiceMock: {
        sendMail: jest.Mock<any>;
    };
    let configServiceMock: {
        getOrThrow: jest.Mock<any>;
    };

    beforeEach(async () => {
        mailerServiceMock = {
            sendMail: jest.fn(async () => {}),
        };

        configServiceMock = {
            getOrThrow: jest.fn((key: string) => {
                if (key === 'FRONTEND_URL') return 'https://app.hitapi.com';
                if (key === 'APP_NAME') return 'HitAPI';
                return '';
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailsService,
                {
                    provide: Services.MAILER,
                    useValue: mailerServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        service = module.get<MailsService>(MailsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('emailConfirmation', () => {
        it('should send verification email with correct parameters and template', async () => {
            await service.emailConfirmation({
                to: 'user@example.com',
                data: {
                    token: 'verify-token-123',
                    displayName: 'John Doe',
                },
            });

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
        });
    });

    describe('passwordReset', () => {
        it('should send password reset email with correct parameters and template', async () => {
            await service.passwordReset({
                to: 'user@example.com',
                data: {
                    token: 'reset-token-456',
                    displayName: 'Jane Doe',
                },
            });

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
        });
    });

    describe('teamInvite', () => {
        it('should send team invite email with correct parameters and template', async () => {
            await service.teamInvite({
                to: 'invitee@example.com',
                data: {
                    token: 'invite-token-789',
                },
            });

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
        });
    });
});
