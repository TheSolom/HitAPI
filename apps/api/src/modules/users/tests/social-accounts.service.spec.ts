import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { UpdateResult } from 'typeorm';
import { SocialAccountsService } from '../social-accounts.service.js';
import type { ISocialAccountsService } from '../interfaces/social-account-service.interface.js';
import { SocialAccount } from '../entities/social-account.entity.js';
import { User } from '../entities/user.entity.js';
import { AuthProvidersEnum } from '../../auth/enums/auth-providers.enum.js';

describe('SocialAccountsService', () => {
    let service: ISocialAccountsService;

    const mockSocialAccountRepository = {
        findOne: jest.fn(),
        findBy: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SocialAccountsService,
                {
                    provide: getRepositoryToken(SocialAccount),
                    useValue: mockSocialAccountRepository,
                },
            ],
        }).compile();

        service = module.get<ISocialAccountsService>(SocialAccountsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findBySocialId', () => {
        it('should return a social account', async () => {
            const socialAccount = new SocialAccount();
            (
                mockSocialAccountRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(socialAccount);

            const result = await service.findBySocialId(
                AuthProvidersEnum.GOOGLE,
                'social-id',
            );
            expect(result).toBe(socialAccount);
            expect(mockSocialAccountRepository.findOne).toHaveBeenCalledWith({
                where: {
                    provider: AuthProvidersEnum.GOOGLE,
                    socialId: 'social-id',
                },
                relations: ['user'],
            });
        });

        it('should return null if not found', async () => {
            (
                mockSocialAccountRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            const result = await service.findBySocialId(
                AuthProvidersEnum.GOOGLE,
                'social-id',
            );
            expect(result).toBeNull();
        });
    });

    describe('findAllByUserId', () => {
        it('should return an array of social accounts', async () => {
            const socialAccounts = [new SocialAccount()];
            (
                mockSocialAccountRepository.findBy as jest.Mock<any>
            ).mockResolvedValue(socialAccounts);

            const result = await service.findAllByUserId('user-id');
            expect(result).toBe(socialAccounts);
            expect(mockSocialAccountRepository.findBy).toHaveBeenCalledWith({
                user: { id: 'user-id' },
            });
        });
    });

    describe('createOrUpdate', () => {
        it('should return an existing social account if it exists', async () => {
            const socialAccount = new SocialAccount();
            (
                mockSocialAccountRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(socialAccount);
            (
                mockSocialAccountRepository.save as jest.Mock<any>
            ).mockResolvedValue(socialAccount);

            const result = await service.createOrUpdate(
                'user-id',
                'social-id',
                AuthProvidersEnum.GOOGLE,
            );
            expect(result).toBe(socialAccount);
            expect(mockSocialAccountRepository.findOne).toHaveBeenCalledWith({
                where: {
                    socialId: 'social-id',
                    provider: AuthProvidersEnum.GOOGLE,
                },
            });
            expect(mockSocialAccountRepository.create).not.toHaveBeenCalled();
            expect(mockSocialAccountRepository.save).toHaveBeenCalledWith(
                socialAccount,
            );
        });

        it('should create and return a new social account if it does not exist', async () => {
            const socialAccount = new SocialAccount();
            (
                mockSocialAccountRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);
            (
                mockSocialAccountRepository.create as jest.Mock<any>
            ).mockReturnValue(socialAccount);
            (
                mockSocialAccountRepository.save as jest.Mock<any>
            ).mockResolvedValue(socialAccount);

            const result = await service.createOrUpdate(
                'user-id',
                'social-id',
                AuthProvidersEnum.GOOGLE,
            );
            expect(result).toBe(socialAccount);
            expect(mockSocialAccountRepository.create).toHaveBeenCalledWith({
                user: { id: 'user-id' },
                socialId: 'social-id',
                provider: AuthProvidersEnum.GOOGLE,
            });
            expect(mockSocialAccountRepository.save).toHaveBeenCalledWith(
                socialAccount,
            );
        });
    });

    describe('hasMultipleLoginMethods', () => {
        it('should return true if user has password and at least one social account', async () => {
            const socialAccount = new SocialAccount();
            socialAccount.user = {
                id: '1',
                password: 'hashed-password',
            } as User;
            (
                mockSocialAccountRepository.findBy as jest.Mock<any>
            ).mockResolvedValue([socialAccount]);

            const result = await service.hasMultipleLoginMethods('user-id');
            expect(result).toBe(true);
        });

        it('should return true if user has multiple social accounts', async () => {
            const socialAccount1 = new SocialAccount();
            socialAccount1.user = { id: '1' } as User;
            const socialAccount2 = new SocialAccount();
            socialAccount2.user = { id: '1' } as User;
            (
                mockSocialAccountRepository.findBy as jest.Mock<any>
            ).mockResolvedValue([socialAccount1, socialAccount2]);

            const result = await service.hasMultipleLoginMethods('user-id');
            expect(result).toBe(true);
        });

        it('should return false if user has no password and only one social account', async () => {
            const socialAccount1 = new SocialAccount();
            socialAccount1.user = { id: '1' } as User;
            (
                mockSocialAccountRepository.findBy as jest.Mock<any>
            ).mockResolvedValue([socialAccount1]);

            const result = await service.hasMultipleLoginMethods('user-id');
            expect(result).toBe(false);
        });

        it('should throw TypeError if no accounts are found', async () => {
            (
                mockSocialAccountRepository.findBy as jest.Mock<any>
            ).mockResolvedValue([]);

            await expect(
                service.hasMultipleLoginMethods('user-id'),
            ).rejects.toThrow(TypeError);
        });
    });

    describe('unlinkAccount', () => {
        it('should return true if delete was successful and affected > 0', async () => {
            (
                mockSocialAccountRepository.delete as jest.Mock<any>
            ).mockResolvedValue({ affected: 1 } as UpdateResult);

            const result = await service.unlinkAccount(
                'user-id',
                AuthProvidersEnum.GOOGLE,
            );
            expect(result).toBe(true);
            expect(mockSocialAccountRepository.delete).toHaveBeenCalledWith({
                user: { id: 'user-id' },
                provider: AuthProvidersEnum.GOOGLE,
            });
        });

        it('should return false if delete was successful but affected is 0', async () => {
            (
                mockSocialAccountRepository.delete as jest.Mock<any>
            ).mockResolvedValue({ affected: 0 } as UpdateResult);

            const result = await service.unlinkAccount(
                'user-id',
                AuthProvidersEnum.GOOGLE,
            );
            expect(result).toBe(false);
        });

        it('should return false if delete returns null or undefined affected', async () => {
            (
                mockSocialAccountRepository.delete as jest.Mock<any>
            ).mockResolvedValue({} as UpdateResult);

            const result = await service.unlinkAccount(
                'user-id',
                AuthProvidersEnum.GOOGLE,
            );
            expect(result).toBe(false);
        });
    });
});
