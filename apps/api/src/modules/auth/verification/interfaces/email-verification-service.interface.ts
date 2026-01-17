import { TokenCacheData } from '../../verification/interfaces/token-cache-data.interface.js';

export interface IEmailVerificationService {
    /**
     * Sends a verification email to the user.
     * @param email The email address of the user.
     * @param displayName The display name of the user.
     * @returns {Promise<string>} A promise that resolves to the token sent to the user.
     */
    sendVerificationEmail(email: string, displayName: string): Promise<string>;
    /**
     * Verifies a verification token.
     * @param token The token to verify.
     * @returns {Promise<TokenCacheData>} A promise that resolves to the token cache data.
     */
    verifyVerificationToken(token: string): Promise<TokenCacheData>;
}
