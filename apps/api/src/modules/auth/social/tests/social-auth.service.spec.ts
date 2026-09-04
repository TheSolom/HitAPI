import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { SocialAuthService } from '../social-auth.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { AuthProvidersEnum } from '../../enums/auth-providers.enum.js';
import { User } from '../../../users/entities/user.entity.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

describe('SocialAuthService', () => {
    let service: SocialAuthService;
    let usersServiceMock: {
        findByEmail: jest.Mock<any>;
        createUser: jest.Mock<any>;
        saveUser: jest.Mock<any>;
    };
    let socialAccountsServiceMock: {
        findBySocialId: jest.Mock<any>;
        createOrUpdate: jest.Mock<any>;
        hasMultipleLoginMethods: jest.Mock<any>;
        unlinkAccount: jest.Mock<any>;
    };

    const mockSocialData = {
        socialId: 'google-12345',
        email: 'social@example.com',
        displayName: 'Google User',
        isVerified: true,
    };

    const existingUser = Object.assign(new User(), {
        id: 'user-id-1',
        email: 'social@example.com',
        displayName: 'Google User',
    });

    beforeEach(async () => {
        usersServiceMock = {
            findByEmail: jest.fn<any>(),
            createUser: jest.fn<any>(async (dto: Record<string, unknown>) =>
                Object.assign(new User(), { id: 'new-user-id', ...dto }),
            ),
            saveUser: jest.fn<any>(async (u: any) => u),
        };
        socialAccountsServiceMock = {
            findBySocialId: jest.fn(),
            createOrUpdate: jest.fn(async () => {}),
            hasMultipleLoginMethods: jest.fn(),
            unlinkAccount: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SocialAuthService,
                { provide: Services.USERS, useValue: usersServiceMock },
                {
                    provide: Services.SOCIAL_ACCOUNTS,
                    useValue: socialAccountsServiceMock,
                },
            ],
        }).compile();

        service = module.get<SocialAuthService>(SocialAuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateSocialLogin', () => {
        it('should login existing social account user', async () => {
            socialAccountsServiceMock.findBySocialId.mockResolvedValue({
                id: 'social-account-id',
                user: existingUser,
            });

            const result = await service.validateSocialLogin(
                AuthProvidersEnum.GOOGLE,
                mockSocialData,
            );

            expect(result).toBeInstanceOf(AuthenticatedUser);
            expect(result.id).toBe('user-id-1');
            expect(
                socialAccountsServiceMock.createOrUpdate,
            ).toHaveBeenCalledWith(
                'user-id-1',
                mockSocialData.socialId,
                AuthProvidersEnum.GOOGLE,
            );
        });

        it('should update user email if user had no email set', async () => {
            const userWithoutEmail = Object.assign(new User(), {
                id: 'user-id-2',
                email: '',
            });
            socialAccountsServiceMock.findBySocialId.mockResolvedValue({
                id: 'social-account-id',
                user: userWithoutEmail,
            });

            await service.validateSocialLogin(
                AuthProvidersEnum.GOOGLE,
                mockSocialData,
            );

            expect(userWithoutEmail.email).toBe(mockSocialData.email);
            expect(usersServiceMock.saveUser).toHaveBeenCalledWith(
                userWithoutEmail,
            );
        });

        it('should link social account to existing user if email matches', async () => {
            socialAccountsServiceMock.findBySocialId.mockResolvedValue(null);
            usersServiceMock.findByEmail.mockResolvedValue(existingUser);

            const result = await service.validateSocialLogin(
                AuthProvidersEnum.GOOGLE,
                mockSocialData,
            );

            expect(result.id).toBe('user-id-1');
            expect(
                socialAccountsServiceMock.createOrUpdate,
            ).toHaveBeenCalledWith(
                'user-id-1',
                mockSocialData.socialId,
                AuthProvidersEnum.GOOGLE,
            );
        });

        it('should create new user and link social account if neither exists', async () => {
            socialAccountsServiceMock.findBySocialId.mockResolvedValue(null);
            usersServiceMock.findByEmail.mockResolvedValue(null);

            const result = await service.validateSocialLogin(
                AuthProvidersEnum.GOOGLE,
                mockSocialData,
            );

            expect(result.id).toBe('new-user-id');
            expect(usersServiceMock.createUser).toHaveBeenCalledWith({
                email: mockSocialData.email,
                displayName: mockSocialData.displayName,
                verified: mockSocialData.isVerified,
            });
            expect(
                socialAccountsServiceMock.createOrUpdate,
            ).toHaveBeenCalledWith(
                'new-user-id',
                mockSocialData.socialId,
                AuthProvidersEnum.GOOGLE,
            );
        });
    });

    describe('unlinkSocialAccount', () => {
        it('should throw UnauthorizedException if user has only one login method', async () => {
            socialAccountsServiceMock.hasMultipleLoginMethods.mockResolvedValue(
                false,
            );

            await expect(
                service.unlinkSocialAccount(
                    'user-id-1',
                    AuthProvidersEnum.GOOGLE,
                ),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if account unlink fails', async () => {
            socialAccountsServiceMock.hasMultipleLoginMethods.mockResolvedValue(
                true,
            );
            socialAccountsServiceMock.unlinkAccount.mockResolvedValue(false);

            await expect(
                service.unlinkSocialAccount(
                    'user-id-1',
                    AuthProvidersEnum.GOOGLE,
                ),
            ).rejects.toThrow(UnauthorizedException);
        });

        it('should successfully unlink when multiple methods exist and account found', async () => {
            socialAccountsServiceMock.hasMultipleLoginMethods.mockResolvedValue(
                true,
            );
            socialAccountsServiceMock.unlinkAccount.mockResolvedValue(true);

            await expect(
                service.unlinkSocialAccount(
                    'user-id-1',
                    AuthProvidersEnum.GOOGLE,
                ),
            ).resolves.not.toThrow();

            expect(
                socialAccountsServiceMock.unlinkAccount,
            ).toHaveBeenCalledWith('user-id-1', AuthProvidersEnum.GOOGLE);
        });
    });
});
