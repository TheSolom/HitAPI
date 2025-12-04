import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Services } from '../../../common/constants/services.constant.js';
import type { ISocialAuthService } from './interfaces/social-auth-service.interface.js';
import type { IUsersService } from '../../users/interfaces/users-service.interface.js';
import type { ISocialAccountsService } from '../../users/interfaces/social-account-service.interface.js';
import type { NullableType } from '../../../common/@types/nullable.type.js';
import { AuthProvidersEnum } from '../enums/auth-providers.enum.js';
import { SocialLoginDto } from './dto/social-login.dto.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { User } from '../../users/entities/user.entity.js';

@Injectable()
export class SocialAuthService implements ISocialAuthService {
    constructor(
        @Inject(Services.USERS) private readonly usersService: IUsersService,
        @Inject(Services.SOCIAL_ACCOUNTS)
        private readonly socialAccountsService: ISocialAccountsService,
    ) {}

    async validateSocialLogin(
        authProvider: AuthProvidersEnum,
        socialData: SocialLoginDto,
    ): Promise<AuthenticatedUser> {
        // Step 1: Check if this social account already exists
        const existingSocialAccount =
            await this.socialAccountsService.findBySocialId(
                authProvider,
                socialData.socialId,
            );

        let user: NullableType<User> = null;

        if (existingSocialAccount) {
            // Social account exists, use the linked user
            user = existingSocialAccount.user;

            // Update social account data
            await this.socialAccountsService.createOrUpdate(
                user.id,
                socialData.socialId,
                authProvider,
            );

            // If user's main email is empty and social provides one, update it
            if (!user.email) {
                user.email = socialData.email;
                await this.usersService.saveUser(user);
            }
        } else {
            // Step 2: Check if a user with this email already exists
            const userByEmail = await this.usersService.findByEmail(
                socialData.email,
            );

            if (userByEmail) {
                // Link this social account to the existing user
                user = userByEmail;

                await this.socialAccountsService.createOrUpdate(
                    user.id,
                    socialData.socialId,
                    authProvider,
                );
            } else {
                // Step 3: Create a new user with this social account
                user = await this.usersService.createUser({
                    email: socialData.email,
                    displayName: socialData.displayName,
                    verified: socialData.isVerified,
                });

                // Create the social account link
                await this.socialAccountsService.createOrUpdate(
                    user.id,
                    socialData.socialId,
                    authProvider,
                );
            }
        }

        return plainToInstance(AuthenticatedUser, user);
    }

    async unlinkSocialAccount(
        userId: string,
        provider: AuthProvidersEnum,
    ): Promise<void> {
        const hasMultipleMethods =
            await this.socialAccountsService.hasMultipleLoginMethods(userId);

        if (!hasMultipleMethods) {
            throw new UnauthorizedException(
                'Cannot unlink the only login method. Please add a password or link another social account first.',
            );
        }

        const success = await this.socialAccountsService.unlinkAccount(
            userId,
            provider,
        );

        if (!success) {
            throw new UnauthorizedException('Social account not found');
        }
    }
}
