import {
    Inject,
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { Services } from '../../../common/constants/services.constant.js';
import type { IPasswordsService } from './interfaces/passwords-service.interface.js';
import type { IPasswordsResetService } from './interfaces/passwords-reset-service.interface.js';
import type { IRateLimitService } from '../../rate-limit/interfaces/rate-limit-service.interface.js';
import type { IUsersService } from '../../users/interfaces/users-service.interface.js';
import type { ISessionsService } from '../sessions/interfaces/sessions-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import { User } from '../../users/entities/user.entity.js';
import { ResetPasswordDto } from './dto/reset-password.dto.js';

@Injectable()
export class PasswordsService implements IPasswordsService {
    private readonly MIN_RESPONSE_TIME_MS = 200;

    constructor(
        @Inject(Services.PASSWORD_RESET)
        private readonly passwordResetService: IPasswordsResetService,
        @Inject(Services.RATE_LIMIT)
        private readonly rateLimitService: IRateLimitService,
        @Inject(Services.USERS)
        private readonly usersService: IUsersService,
        @Inject(Services.SESSIONS)
        private readonly sessionsService: ISessionsService,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
    ) {}

    private async updateUserPassword(
        user: User,
        newPassword: string,
    ): Promise<void> {
        user.password = await this.hashingService.hashPassword(newPassword);
        await this.usersService.saveUser(user);
        await this.sessionsService.revokeAllUserSessions(user.id);
    }

    private async ensureMinimumResponseTime(startTime: number): Promise<void> {
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < this.MIN_RESPONSE_TIME_MS) {
            await new Promise((resolve) =>
                setTimeout(resolve, this.MIN_RESPONSE_TIME_MS - elapsedTime),
            );
        }
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const startTime = Date.now();

        const user = await this.usersService.findByEmail(email, {
            requireVerified: true,
        });

        if (user) {
            try {
                await this.passwordResetService.sendPasswordResetEmail(
                    email,
                    user.displayName,
                );
            } catch (error) {
                console.error('Failed to send password reset email:', error);
            }
        }

        await this.ensureMinimumResponseTime(startTime);

        return {
            message: 'Password reset email sent if email is valid',
        };
    }

    async resetPassword(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }> {
        const tokenData = await this.passwordResetService.verifyResetToken(
            resetPasswordDto.token,
        );

        const user = await this.usersService.findByEmail(tokenData.email, {
            includePassword: true,
            requireVerified: true,
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        await this.updateUserPassword(user, resetPasswordDto.newPassword);

        await this.rateLimitService.clearRateLimit(
            tokenData.email,
            'PASSWORD_RESET',
        );

        return {
            message: 'Password reset successfully',
        };
    }

    async changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<{ message: string }> {
        const user = await this.usersService.findById(userId, {
            includePassword: true,
            requireVerified: true,
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.hasPassword()) {
            throw new BadRequestException('User has no password set');
        }

        const isValid = await this.hashingService.verifyPassword(
            currentPassword,
            user.password!,
        );

        if (!isValid) {
            throw new UnauthorizedException('Wrong password');
        }

        await this.updateUserPassword(user, newPassword);

        return { message: 'Password changed successfully' };
    }

    async setPassword(
        userId: string,
        newPassword: string,
    ): Promise<{ message: string }> {
        const user = await this.usersService.findById(userId, {
            includePassword: true,
            requireVerified: true,
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (user.hasPassword()) {
            throw new BadRequestException(
                'User already has a password. Use change password instead.',
            );
        }

        await this.updateUserPassword(user, newPassword);

        return { message: 'Password set successfully' };
    }
}
