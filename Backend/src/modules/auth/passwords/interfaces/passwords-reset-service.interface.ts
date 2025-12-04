import { TokenCacheData } from '../../verification/interfaces/token-cache-data.interface.js';

export interface IPasswordsResetService {
    /**
     * Sends a password reset email to the user.
     * @param email The email address of the user.
     * @param displayName The display name of the user.
     * @returns {Promise<string>} A promise that resolves to the token sent to the user.
     */
    sendPasswordResetEmail(email: string, displayName: string): Promise<string>;
    /**
     * Verifies a password reset token.
     * @param token The token to verify.
     * @returns {Promise<TokenCacheData>} A promise that resolves to the token cache data.
     */
    verifyResetToken(token: string): Promise<TokenCacheData>;
}
