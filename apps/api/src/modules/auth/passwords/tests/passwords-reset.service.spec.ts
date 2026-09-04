import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PasswordsResetService } from '../passwords-reset.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { MailSubjects } from '../../../mails/enums/mails.enum.js';

describe('PasswordsResetService', () => {
    let service: PasswordsResetService;
    let rateLimitServiceMock: {
        checkRateLimit: jest.Mock<any>;
        clearRateLimit: jest.Mock<any>;
    };
    let verificationTokensServiceMock: {
        createToken: jest.Mock<any>;
        consumeToken: jest.Mock<any>;
        invalidateToken: jest.Mock<any>;
    };
    let mailsServiceMock: {
        passwordReset: jest.Mock<any>;
    };
    let configServiceMock: {
        get: jest.Mock<any>;
    };

    beforeEach(async () => {
        rateLimitServiceMock = {
            checkRateLimit: jest.fn(async () => {}),
            clearRateLimit: jest.fn(async () => {}),
        };
        verificationTokensServiceMock = {
            createToken: jest.fn(async () => 'reset-token-123'),
            consumeToken: jest.fn(),
            invalidateToken: jest.fn(async () => {}),
        };
        mailsServiceMock = {
            passwordReset: jest.fn(async () => {}),
        };
        configServiceMock = {
            get: jest.fn(() => 3600),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordsResetService,
                {
                    provide: Services.RATE_LIMIT,
                    useValue: rateLimitServiceMock,
                },
                {
                    provide: Services.VERIFICATION_TOKENS,
                    useValue: verificationTokensServiceMock,
                },
                { provide: Services.MAILS, useValue: mailsServiceMock },
                { provide: ConfigService, useValue: configServiceMock },
            ],
        }).compile();

        service = module.get<PasswordsResetService>(PasswordsResetService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendPasswordResetEmail', () => {
        it('should create token and send email', async () => {
            const token = await service.sendPasswordResetEmail(
                'test@example.com',
                'Test User',
            );

            expect(token).toBe('reset-token-123');
            expect(rateLimitServiceMock.checkRateLimit).toHaveBeenCalledWith(
                'test@example.com',
                MailSubjects.PASSWORD_RESET,
            );
            expect(
                verificationTokensServiceMock.createToken,
            ).toHaveBeenCalledWith(
                {
                    email: 'test@example.com',
                    displayName: 'Test User',
                    subject: MailSubjects.PASSWORD_RESET,
                },
                3600,
            );
            expect(mailsServiceMock.passwordReset).toHaveBeenCalledWith({
                to: 'test@example.com',
                data: { token: 'reset-token-123', displayName: 'Test User' },
            });
        });

        it('should invalidate token and throw InternalServerErrorException if mail fails', async () => {
            mailsServiceMock.passwordReset.mockRejectedValue(
                new Error('SMTP Error'),
            );

            await expect(
                service.sendPasswordResetEmail('test@example.com', 'Test User'),
            ).rejects.toThrow(InternalServerErrorException);
            expect(
                verificationTokensServiceMock.invalidateToken,
            ).toHaveBeenCalledWith('reset-token-123');
        });
    });

    describe('verifyResetToken', () => {
        it('should consume token and clear rate limit when subject matches', async () => {
            const tokenData = {
                email: 'test@example.com',
                displayName: 'Test User',
                subject: MailSubjects.PASSWORD_RESET,
            };
            verificationTokensServiceMock.consumeToken.mockResolvedValue(
                tokenData,
            );

            const result = await service.verifyResetToken('valid-token');

            expect(result).toEqual(tokenData);
            expect(rateLimitServiceMock.clearRateLimit).toHaveBeenCalledWith(
                'test@example.com',
                MailSubjects.PASSWORD_RESET,
            );
        });

        it('should throw BadRequestException if subject is wrong', async () => {
            verificationTokensServiceMock.consumeToken.mockResolvedValue({
                email: 'test@example.com',
                subject: MailSubjects.EMAIL_VERIFICATION,
            });

            await expect(
                service.verifyResetToken('wrong-subject-token'),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
