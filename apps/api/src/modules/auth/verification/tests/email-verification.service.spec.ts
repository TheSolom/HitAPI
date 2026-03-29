/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationService } from '../email-verification.service.js';
import type { IEmailVerificationService } from '../interfaces/email-verification-service.interface.js';
import type { IRateLimitService } from '../../../rate-limit/interfaces/rate-limit-service.interface.js';
import type { IVerificationTokensService } from '../interfaces/verification-tokens-service.interface.js';
import type { IMailsService } from '../../../mails/interfaces/mails-service.interface.js';
import { Services } from '../../../../common/constants/services.constant.js';
import {
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { MailSubjects } from '../../../mails/enums/mails.enum.js';

describe('EmailVerificationService', () => {
    let service: IEmailVerificationService;
    let rateLimitService: jest.Mocked<IRateLimitService>;
    let verificationTokenService: jest.Mocked<IVerificationTokensService>;
    let mailsService: jest.Mocked<IMailsService>;

    beforeEach(async () => {
        const rateLimitServiceMock: jest.Mocked<IRateLimitService> = {
            checkRateLimit: jest.fn(),
            clearRateLimit: jest.fn(),
            getRemainingRequests: jest.fn(),
        } as unknown as jest.Mocked<IRateLimitService>;

        const verificationTokenServiceMock: jest.Mocked<IVerificationTokensService> =
            {
                createToken: jest.fn(),
                consumeToken: jest.fn(),
                invalidateToken: jest.fn(),
                getTokenData: jest.fn(),
            } as unknown as jest.Mocked<IVerificationTokensService>;

        const mailsServiceMock: jest.Mocked<IMailsService> = {
            emailConfirmation: jest.fn(),
            passwordReset: jest.fn(),
            teamInvite: jest.fn(),
        } as unknown as jest.Mocked<IMailsService>;

        const configServiceMock = {
            get: jest.fn().mockImplementation((key) => {
                if (key === 'CACHE_TTL_EMAIL_VERIFICATION') return 3600;
                return null;
            }),
        } as unknown as jest.Mocked<ConfigService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmailVerificationService,
                {
                    provide: Services.RATE_LIMIT,
                    useValue: rateLimitServiceMock,
                },
                {
                    provide: Services.VERIFICATION_TOKENS,
                    useValue: verificationTokenServiceMock,
                },
                {
                    provide: Services.MAILS,
                    useValue: mailsServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        service = module.get<IEmailVerificationService>(
            EmailVerificationService,
        );
        rateLimitService = module.get(Services.RATE_LIMIT);
        verificationTokenService = module.get(Services.VERIFICATION_TOKENS);
        mailsService = module.get(Services.MAILS);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('sendVerificationEmail', () => {
        const email = 'test@example.com';
        const displayName = 'Test User';
        const token = 'generated-token';

        it('should send verification email successfully', async () => {
            verificationTokenService.createToken.mockResolvedValue(token);
            mailsService.emailConfirmation.mockResolvedValue();

            const result = await service.sendVerificationEmail(
                email,
                displayName,
            );

            expect(result).toBe(token);
            expect(rateLimitService.checkRateLimit).toHaveBeenCalledWith(
                email,
                MailSubjects.EMAIL_VERIFICATION,
            );
            expect(verificationTokenService.createToken).toHaveBeenCalledWith(
                {
                    email,
                    displayName,
                    subject: MailSubjects.EMAIL_VERIFICATION,
                },
                3600,
            );
            expect(mailsService.emailConfirmation).toHaveBeenCalledWith({
                to: email,
                data: { token, displayName },
            });
            expect(
                verificationTokenService.invalidateToken,
            ).not.toHaveBeenCalled();
        });

        it('should invalidate token and throw InternalServerErrorException if email sending fails', async () => {
            verificationTokenService.createToken.mockResolvedValue(token);
            mailsService.emailConfirmation.mockRejectedValue(
                new Error('Send missing'),
            );

            await expect(
                service.sendVerificationEmail(email, displayName),
            ).rejects.toThrow(InternalServerErrorException);

            expect(
                verificationTokenService.invalidateToken,
            ).toHaveBeenCalledWith(token);
        });
    });

    describe('verifyVerificationToken', () => {
        const token = 'some-token';

        it('should consume token and return data if subject matches', async () => {
            const data = {
                email: 'test@example.com',
                displayName: 'Test User',
                subject: MailSubjects.EMAIL_VERIFICATION,
            };
            verificationTokenService.consumeToken.mockResolvedValue(data);

            const result = await service.verifyVerificationToken(token);

            expect(result).toEqual(data);
            expect(verificationTokenService.consumeToken).toHaveBeenCalledWith(
                token,
            );
            expect(rateLimitService.clearRateLimit).toHaveBeenCalledWith(
                data.email,
                MailSubjects.EMAIL_VERIFICATION,
            );
        });

        it('should throw BadRequestException if subject does not match', async () => {
            const data = {
                email: 'test@example.com',
                displayName: 'Test User',
                subject: expect.any(MailSubjects) as MailSubjects,
            };
            verificationTokenService.consumeToken.mockResolvedValue(data);

            await expect(
                service.verifyVerificationToken(token),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.verifyVerificationToken(token),
            ).rejects.toThrow('Invalid verification token');

            expect(rateLimitService.clearRateLimit).not.toHaveBeenCalled();
        });
    });
});
