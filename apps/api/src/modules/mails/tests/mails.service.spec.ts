import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { ClsService } from 'nestjs-cls';
import { MailsService } from '../mails.service.js';
import { QUEUES, JOBS } from '../../../common/constants/queue.constant.js';

describe('MailsService', () => {
    let service: MailsService;
    let mailsQueueMock: {
        add: jest.Mock<any>;
    };
    let clsMock: {
        get: jest.Mock<any>;
    };

    beforeEach(async () => {
        mailsQueueMock = {
            add: jest.fn(async () => {}),
        };

        clsMock = {
            get: jest.fn((key: string) => {
                if (key === 'traceId') return 'trace-123';
                return undefined;
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MailsService,
                {
                    provide: getQueueToken(QUEUES.MAILS),
                    useValue: mailsQueueMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
            ],
        }).compile();

        service = module.get<MailsService>(MailsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('emailConfirmation', () => {
        it('should queue email confirmation job with correct parameters and traceId', async () => {
            await service.emailConfirmation({
                to: 'user@example.com',
                data: {
                    token: 'verify-token-123',
                    displayName: 'John Doe',
                },
            });

            expect(mailsQueueMock.add).toHaveBeenCalledWith(
                JOBS.EMAIL_CONFIRMATION,
                {
                    to: 'user@example.com',
                    token: 'verify-token-123',
                    displayName: 'John Doe',
                    traceId: 'trace-123',
                },
            );
        });
    });

    describe('passwordReset', () => {
        it('should queue password reset job with correct parameters and traceId', async () => {
            await service.passwordReset({
                to: 'user@example.com',
                data: {
                    token: 'reset-token-456',
                    displayName: 'Jane Doe',
                },
            });

            expect(mailsQueueMock.add).toHaveBeenCalledWith(
                JOBS.PASSWORD_RESET,
                {
                    to: 'user@example.com',
                    token: 'reset-token-456',
                    displayName: 'Jane Doe',
                    traceId: 'trace-123',
                },
            );
        });
    });

    describe('teamInvite', () => {
        it('should queue team invite job with correct parameters and traceId', async () => {
            await service.teamInvite({
                to: 'invitee@example.com',
                data: {
                    token: 'invite-token-789',
                },
            });

            expect(mailsQueueMock.add).toHaveBeenCalledWith(JOBS.TEAM_INVITE, {
                to: 'invitee@example.com',
                token: 'invite-token-789',
                traceId: 'trace-123',
            });
        });
    });
});
