import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PasswordsService } from '../passwords.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { User } from '../../../users/entities/user.entity.js';

describe('PasswordsService', () => {
    let service: PasswordsService;
    let passwordResetServiceMock: {
        sendPasswordResetEmail: jest.Mock<any>;
        verifyResetToken: jest.Mock<any>;
    };
    let usersServiceMock: {
        findByEmail: jest.Mock<any>;
        findById: jest.Mock<any>;
        saveUser: jest.Mock<any>;
    };
    let sessionsServiceMock: {
        revokeAllUserSessions: jest.Mock<any>;
    };
    let hashingServiceMock: {
        hashPassword: jest.Mock<any>;
        verifyPassword: jest.Mock<any>;
    };

    const mockUser = Object.assign(new User(), {
        id: 'user-id-1',
        email: 'user@example.com',
        displayName: 'Test User',
        password: 'hashedOldPassword',
    });

    beforeEach(async () => {
        passwordResetServiceMock = {
            sendPasswordResetEmail: jest.fn<any>(async () => 'token'),
            verifyResetToken: jest.fn<any>(),
        };
        usersServiceMock = {
            findByEmail: jest.fn<any>(),
            findById: jest.fn<any>(),
            saveUser: jest.fn<any>(async (u: any) => u),
        };
        sessionsServiceMock = {
            revokeAllUserSessions: jest.fn<any>(async () => {}),
        };
        hashingServiceMock = {
            hashPassword: jest.fn<any>(async (p: string) => `hashed_${p}`),
            verifyPassword: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordsService,
                {
                    provide: Services.PASSWORD_RESET,
                    useValue: passwordResetServiceMock,
                },
                { provide: Services.USERS, useValue: usersServiceMock },
                { provide: Services.SESSIONS, useValue: sessionsServiceMock },
                { provide: Services.HASHING, useValue: hashingServiceMock },
            ],
        }).compile();

        service = module.get<PasswordsService>(PasswordsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('forgotPassword', () => {
        it('should send email if user exists and return confirmation message', async () => {
            usersServiceMock.findByEmail.mockResolvedValue(mockUser);

            const result = await service.forgotPassword('user@example.com');

            expect(result.message).toContain('Password reset email sent');
            expect(
                passwordResetServiceMock.sendPasswordResetEmail,
            ).toHaveBeenCalledWith('user@example.com', 'Test User');
        });

        it('should return confirmation message without error even if user does not exist', async () => {
            usersServiceMock.findByEmail.mockResolvedValue(null);

            const result = await service.forgotPassword('unknown@example.com');

            expect(result.message).toContain('Password reset email sent');
            expect(
                passwordResetServiceMock.sendPasswordResetEmail,
            ).not.toHaveBeenCalled();
        });
    });

    describe('resetPassword', () => {
        it('should reset password, save user, and revoke all sessions', async () => {
            passwordResetServiceMock.verifyResetToken.mockResolvedValue({
                email: 'user@example.com',
            });
            usersServiceMock.findByEmail.mockResolvedValue(mockUser);

            const result = await service.resetPassword({
                token: 'valid-reset-token',
                newPassword: 'newSecretPassword123',
                confirmPassword: 'newSecretPassword123',
            });

            expect(result.message).toBe('Password reset successfully');
            expect(hashingServiceMock.hashPassword).toHaveBeenCalledWith(
                'newSecretPassword123',
            );
            expect(usersServiceMock.saveUser).toHaveBeenCalled();
            expect(
                sessionsServiceMock.revokeAllUserSessions,
            ).toHaveBeenCalledWith('user-id-1');
        });

        it('should throw UnauthorizedException if user not found', async () => {
            passwordResetServiceMock.verifyResetToken.mockResolvedValue({
                email: 'user@example.com',
            });
            usersServiceMock.findByEmail.mockResolvedValue(null);

            await expect(
                service.resetPassword({
                    token: 'valid-reset-token',
                    newPassword: 'newSecretPassword123',
                    confirmPassword: 'newSecretPassword123',
                }),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('changePassword', () => {
        it('should verify old password and update with new password', async () => {
            usersServiceMock.findById.mockResolvedValue(mockUser);
            hashingServiceMock.verifyPassword.mockResolvedValue(true);

            const result = await service.changePassword(
                'user-id-1',
                'hashedOldPassword',
                'brandNewPassword',
            );

            expect(result.message).toBe('Password changed successfully');
            expect(hashingServiceMock.verifyPassword).toHaveBeenCalled();
            expect(hashingServiceMock.hashPassword).toHaveBeenCalledWith(
                'brandNewPassword',
            );
            expect(
                sessionsServiceMock.revokeAllUserSessions,
            ).toHaveBeenCalledWith('user-id-1');
        });

        it('should throw UnauthorizedException on wrong current password', async () => {
            usersServiceMock.findById.mockResolvedValue(mockUser);
            hashingServiceMock.verifyPassword.mockResolvedValue(false);

            await expect(
                service.changePassword(
                    'user-id-1',
                    'wrongCurrentPassword',
                    'brandNewPassword',
                ),
            ).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('setPassword', () => {
        it('should set password when user does not have a password', async () => {
            const userWithoutPassword = Object.assign(new User(), {
                id: 'user-id-2',
                email: 'nopass@example.com',
                password: null,
            });
            usersServiceMock.findById.mockResolvedValue(userWithoutPassword);

            const result = await service.setPassword(
                'user-id-2',
                'newFirstPassword',
            );

            expect(result.message).toBe('Password set successfully');
            expect(hashingServiceMock.hashPassword).toHaveBeenCalledWith(
                'newFirstPassword',
            );
            expect(usersServiceMock.saveUser).toHaveBeenCalled();
        });

        it('should throw BadRequestException if user already has a password', async () => {
            usersServiceMock.findById.mockResolvedValue(mockUser);

            await expect(
                service.setPassword('user-id-1', 'anotherPassword'),
            ).rejects.toThrow(BadRequestException);
        });
    });
});
