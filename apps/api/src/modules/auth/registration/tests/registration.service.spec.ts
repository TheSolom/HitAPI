import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
} from '@nestjs/common';
import { RegistrationService } from '../registration.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { User } from '../../../users/entities/user.entity.js';

describe('RegistrationService', () => {
    let service: RegistrationService;
    let usersServiceMock: {
        findByEmail: jest.Mock<any>;
        createUser: jest.Mock<any>;
        updateUser: jest.Mock<any>;
        saveUser: jest.Mock<any>;
    };
    let tokensServiceMock: {
        generateTokenPair: jest.Mock<any>;
    };
    let emailVerificationServiceMock: {
        sendVerificationEmail: jest.Mock<any>;
        verifyVerificationToken: jest.Mock<any>;
    };
    let hashingServiceMock: {
        hashPassword: jest.Mock<any>;
    };

    const registrationDto = {
        email: 'newuser@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        displayName: 'New User',
    };

    beforeEach(async () => {
        usersServiceMock = {
            findByEmail: jest.fn<any>(),
            createUser: jest.fn<any>(async (u: any) => u),
            updateUser: jest.fn<any>(async () => {}),
            saveUser: jest.fn<any>(async (u: any) => u),
        };
        tokensServiceMock = {
            generateTokenPair: jest.fn(async () => ({
                access_token: 'acc.token',
                token_type: 'Bearer',
                expires_in: 900,
                refresh_token: 'ref.token',
                refresh_token_expires_in: 604800,
            })),
        };
        emailVerificationServiceMock = {
            sendVerificationEmail: jest.fn(async () => {}),
            verifyVerificationToken: jest.fn(),
        };
        hashingServiceMock = {
            hashPassword: jest.fn(async () => 'hashed_Password123!'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RegistrationService,
                { provide: Services.USERS, useValue: usersServiceMock },
                { provide: Services.TOKENS, useValue: tokensServiceMock },
                {
                    provide: Services.EMAIL_VERIFICATION,
                    useValue: emailVerificationServiceMock,
                },
                { provide: Services.HASHING, useValue: hashingServiceMock },
            ],
        }).compile();

        service = module.get<RegistrationService>(RegistrationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('registerUser', () => {
        it('should register brand new user and send verification email', async () => {
            usersServiceMock.findByEmail.mockResolvedValue(null);

            const result = await service.registerUser(registrationDto);

            expect(result.message).toBe('Verification email sent');
            expect(hashingServiceMock.hashPassword).toHaveBeenCalledWith(
                registrationDto.password,
            );
            expect(usersServiceMock.createUser).toHaveBeenCalled();
            expect(
                emailVerificationServiceMock.sendVerificationEmail,
            ).toHaveBeenCalledWith(
                registrationDto.email,
                registrationDto.displayName,
            );
        });

        it('should update unverified user and send verification email', async () => {
            const unverifiedUser = Object.assign(new User(), {
                id: 'unverified-id',
                email: registrationDto.email,
                displayName: 'Old Name',
            });
            unverifiedUser.isVerified = false;
            usersServiceMock.findByEmail.mockResolvedValue(unverifiedUser);

            const result = await service.registerUser(registrationDto);

            expect(result.message).toBe('Verification email sent');
            expect(usersServiceMock.updateUser).toHaveBeenCalledWith(
                'unverified-id',
                {
                    displayName: registrationDto.displayName,
                    password: 'hashed_Password123!',
                },
            );
        });

        it('should throw ConflictException if user is already verified', async () => {
            const verifiedUser = Object.assign(new User(), {
                id: 'verified-id',
                email: registrationDto.email,
            });
            verifiedUser.isVerified = true;
            usersServiceMock.findByEmail.mockResolvedValue(verifiedUser);

            await expect(service.registerUser(registrationDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('verifyEmail', () => {
        it('should mark user verified and return tokens', async () => {
            emailVerificationServiceMock.verifyVerificationToken.mockResolvedValue(
                {
                    email: registrationDto.email,
                },
            );
            const unverifiedUser = Object.assign(new User(), {
                id: 'user-id-1',
                email: registrationDto.email,
            });
            unverifiedUser.isVerified = false;
            usersServiceMock.findByEmail.mockResolvedValue(unverifiedUser);

            const tokens = await service.verifyEmail(
                'valid-verify-token',
                'device',
                'ip',
            );

            expect(unverifiedUser.isVerified).toBe(true);
            expect(usersServiceMock.saveUser).toHaveBeenCalledWith(
                unverifiedUser,
            );
            expect(tokensServiceMock.generateTokenPair).toHaveBeenCalled();
            expect(tokens.access_token).toBe('acc.token');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            emailVerificationServiceMock.verifyVerificationToken.mockResolvedValue(
                {
                    email: 'nonexistent@example.com',
                },
            );
            usersServiceMock.findByEmail.mockResolvedValue(null);

            await expect(service.verifyEmail('token')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw ConflictException if already verified', async () => {
            emailVerificationServiceMock.verifyVerificationToken.mockResolvedValue(
                {
                    email: registrationDto.email,
                },
            );
            const verifiedUser = Object.assign(new User(), {
                id: 'user-id-1',
                email: registrationDto.email,
            });
            verifiedUser.isVerified = true;
            usersServiceMock.findByEmail.mockResolvedValue(verifiedUser);

            await expect(service.verifyEmail('token')).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('resendVerificationEmail', () => {
        it('should resend verification email for unverified user', async () => {
            const unverifiedUser = Object.assign(new User(), {
                id: 'user-id-1',
                email: 'user@example.com',
                displayName: 'Test',
            });
            unverifiedUser.isVerified = false;
            usersServiceMock.findByEmail.mockResolvedValue(unverifiedUser);

            const result =
                await service.resendVerificationEmail('user@example.com');

            expect(result.message).toBe('Verification email sent');
            expect(
                emailVerificationServiceMock.sendVerificationEmail,
            ).toHaveBeenCalledWith('user@example.com', 'Test');
        });

        it('should throw BadRequestException if user not found', async () => {
            usersServiceMock.findByEmail.mockResolvedValue(null);

            await expect(
                service.resendVerificationEmail('unknown@example.com'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if already verified', async () => {
            const verifiedUser = Object.assign(new User(), {
                id: 'user-id-1',
                email: 'user@example.com',
            });
            verifiedUser.isVerified = true;
            usersServiceMock.findByEmail.mockResolvedValue(verifiedUser);

            await expect(
                service.resendVerificationEmail('user@example.com'),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
