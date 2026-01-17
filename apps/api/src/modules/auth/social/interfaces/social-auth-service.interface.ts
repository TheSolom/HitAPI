import { AuthProvidersEnum } from '../../enums/auth-providers.enum.js';
import { SocialLoginDto } from '../dto/social-login.dto.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

export interface ISocialAuthService {
    /**
     * Validates a social login attempt and returns an authenticated user.
     * @param authProvider The social authentication provider (e.g., Google, Facebook).
     * @param socialData DTO containing social login data (e.g., access token).
     * @returns {Promise<AuthenticatedUser>} A promise that resolves to an AuthenticatedUser object.
     */
    validateSocialLogin(
        authProvider: AuthProvidersEnum,
        socialData: SocialLoginDto,
    ): Promise<AuthenticatedUser>;
    /**
     * Unlinks a social account from a user's profile.
     * @param userId The ID of the user whose social account is to be unlinked.
     * @param provider The social authentication provider to unlink.
     * @returns {Promise<void>} A promise that resolves when the account is successfully unlinked.
     */
    unlinkSocialAccount(
        userId: string,
        provider: AuthProvidersEnum,
    ): Promise<void>;
}
