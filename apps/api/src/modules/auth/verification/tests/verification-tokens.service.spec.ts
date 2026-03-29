/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import type { Cache } from 'cache-manager';
import { VerificationTokenService } from '../verification-tokens.service.js';
import type { IVerificationTokensService } from '../interfaces/verification-tokens-service.interface.js';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Services } from '../../../../common/constants/services.constant.js';
import { BadRequestException } from '@nestjs/common';
import { MailSubjects } from '../../../mails/enums/mails.enum.js';
import type { IHashingService } from '../../../hashing/interfaces/hashing-service.interface.js';

describe('VerificationTokenService', () => {
    let service: IVerificationTokensService;
    let cacheManager: jest.Mocked<Cache>;
    let hashingService: jest.Mocked<IHashingService>;

    beforeEach(async () => {
        const cacheManagerMock: jest.Mocked<Cache> = {
            set: jest.fn(),
            get: jest.fn(),
            del: jest.fn(),
        } as unknown as jest.Mocked<Cache>;

        const hashingServiceMock: jest.Mocked<IHashingService> = {
            hash: jest
                .fn()
                .mockImplementation((val: string) => `hashed-${val}`),
        } as unknown as jest.Mocked<IHashingService>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VerificationTokenService,
                {
                    provide: CACHE_MANAGER,
                    useValue: cacheManagerMock,
                },
                {
                    provide: Services.HASHING,
                    useValue: hashingServiceMock,
                },
            ],
        }).compile();

        service = module.get<IVerificationTokensService>(
            VerificationTokenService,
        );
        cacheManager = module.get(CACHE_MANAGER);
        hashingService = module.get(Services.HASHING);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createToken', () => {
        it('should create and cache a token', async () => {
            const data = {
                email: 'test@example.com',
                subject: MailSubjects.EMAIL_VERIFICATION,
                displayName: 'Test User',
            };
            const ttl = 3600;

            const token = await service.createToken(data, ttl);

            expect(token).toBeDefined();
            expect(hashingService.hash).toHaveBeenCalledWith(token);
            expect(cacheManager.set).toHaveBeenCalledWith(
                `verification:hashed-${token}`,
                data,
                ttl * 1000,
            );
        });
    });

    describe('getTokenData', () => {
        it('should get token data from cache', async () => {
            const token = 'test-token';
            const data = { email: 'test@example.com' };
            cacheManager.get.mockResolvedValue(data);

            const result = await service.getTokenData(token);

            expect(result).toEqual(data);
            expect(hashingService.hash).toHaveBeenCalledWith(token);
            expect(cacheManager.get).toHaveBeenCalledWith(
                'verification:hashed-test-token',
            );
        });
    });

    describe('invalidateToken', () => {
        it('should delete token from cache', async () => {
            const token = 'test-token';

            await service.invalidateToken(token);

            expect(hashingService.hash).toHaveBeenCalledWith(token);
            expect(cacheManager.del).toHaveBeenCalledWith(
                'verification:hashed-test-token',
            );
        });
    });

    describe('consumeToken', () => {
        it('should consume a valid token', async () => {
            const token = 'test-token';
            const data = { email: 'test@example.com' };
            cacheManager.get.mockResolvedValue(data);

            const invalidateTokenSpy = jest
                .spyOn(service, 'invalidateToken')
                .mockResolvedValue(undefined);

            const result = await service.consumeToken(token);

            expect(result).toEqual(data);
            expect(cacheManager.get).toHaveBeenCalledWith(
                'verification:hashed-test-token',
            );
            expect(invalidateTokenSpy).toHaveBeenCalledWith(token);
        });

        it('should throw BadRequestException for invalid token', async () => {
            const token = 'invalid-token';
            cacheManager.get.mockResolvedValue(null);

            await expect(service.consumeToken(token)).rejects.toThrow(
                BadRequestException,
            );
            await expect(service.consumeToken(token)).rejects.toThrow(
                'Invalid or expired token',
            );

            // Should not call invalidate
            const invalidateTokenSpy = jest.spyOn(service, 'invalidateToken');
            expect(invalidateTokenSpy).not.toHaveBeenCalled();
        });
    });
});
