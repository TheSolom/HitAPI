import { AuthProvidersEnum } from '../../auth/enums/auth-providers.enum.js';
import { SocialAccount } from '../entities/social-account.entity.js';
import { SocialLoginDto } from '../../auth/social/dto/social-login.dto.js';
import { NullableType } from '../../../common/@types/nullable.type.js';

export interface ISocialAccountsService {
    /**
     * Finds a social account by its provider and social ID.
     * @param provider - The authentication provider (e.g., Google, Facebook).
     * @param socialId - The unique ID provided by the social authentication service.
     * @returns A Promise that resolves to the SocialAccount if found, otherwise null.
     */
    findBySocialId(
        provider: AuthProvidersEnum,
        socialId: string,
    ): Promise<NullableType<SocialAccount>>;
    /**
     * Finds all social accounts linked to a specific user.
     * @param userId - The ID of the user.
     * @returns A Promise that resolves to an array of SocialAccount entities.
     */
    findAllByUserId(userId: string): Promise<SocialAccount[]>;
    /**
     * Creates a new social account or updates an existing one for a given user.
     * @param userId - The ID of the user.
     * @param socialId - The unique ID provided by the social authentication service.
     * @param provider - The authentication provider.
     * @returns A Promise that resolves to the created or updated SocialAccount entity.
     */
    createOrUpdate(
        userId: string,
        socialId: string,
        provider: AuthProvidersEnum,
    ): Promise<SocialAccount>;
    /**
     * Checks if a user has multiple login methods (e.g., password and a social account, or multiple social accounts).
     * @param userId - The ID of the user.
     * @returns A Promise that resolves to true if the user has multiple login methods, false otherwise.
     */
    hasMultipleLoginMethods(userId: string): Promise<boolean>;
    /**
     * Unlinks a social account from a user.
     * @param userId - The ID of the user.
     * @param provider - The authentication provider of the account to unlink.
     * @returns A Promise that resolves to true if the account was successfully unlinked, false otherwise.
     */
    unlinkAccount(
        userId: string,
        provider: AuthProvidersEnum,
    ): Promise<boolean>;
}
