import { TokenCacheData } from './token-cache-data.interface.js';
import { MaybeType } from '../../../../common/types/maybe.type.js';

export interface IVerificationTokensService {
    /**
     * Creates a new token for a user.
     * @param data The data to create a token for.
     * @param ttl The time-to-live for the token, in seconds.
     * @returns {Promise<string>} A promise that resolves to the token string.
     */
    createToken(data: TokenCacheData, ttl: number): Promise<string>;
    /**
     * Retrieves the data associated with a verification token.
     * @param token The verification token string to retrieve data for.
     * @returns {Promise<MaybeType<TokenCacheData>>} A promise that resolves to the token data associated with the token, or null if the token is invalid or expired.
     */
    getTokenData(token: string): Promise<MaybeType<TokenCacheData>>;
    /**
     * Invalidates a verification token, marking it as used.
     * @param token The verification token string to invalidate.
     * @returns {Promise<void>} A promise that resolves when the token is invalidated.
     */
    invalidateToken(token: string): Promise<void>;
    /**
     * Consumes a verification token, marking it as used and returning its associated data.
     * @param token The verification token string to consume.
     * @returns {Promise<TokenCacheData>} A promise that resolves to the token data associated with the token.
     * @throws {BadRequestException} If the token has already been consumed or is expired.
     */
    consumeToken(token: string): Promise<TokenCacheData>;
}
