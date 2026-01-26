import { JwtPayload } from 'jsonwebtoken';
import { NullableType } from '../../../../common/types/nullable.type.js';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { LoginTokensDto } from '../dto/login-tokens.dto.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

export interface ITokensService {
    /**
     * Verifies an access token.
     * @param token The access token string.
     * @param secret The secret key used to sign the token.
     * @returns {JwtPayload} The decoded JWT payload.
     */
    verifyAccessToken(token: string, secret: string): JwtPayload;
    /**
     * Verifies a refresh token.
     * @param token The refresh token string.
     * @param userId The ID of the user associated with the token.
     * @returns {Promise<NullableType<RefreshToken>>} The RefreshToken entity if valid, otherwise null.
     */
    verifyRefreshToken(
        token: string,
        userId: string,
    ): Promise<NullableType<RefreshToken>>;
    /**
     * Generates a new access token and refresh token pair.
     * @param user The authenticated user for whom to generate tokens.
     * @param deviceInfo Optional device information associated with the token.
     * @param ipAddress Optional IP address from which the token was requested.
     * @returns {Promise<LoginTokensDto>} An object containing the access token and refresh token.
     */
    generateTokenPair(
        user: AuthenticatedUser,
        deviceInfo?: string,
        ipAddress?: string,
    ): Promise<LoginTokensDto>;
    /**
     * Revokes a specific refresh token for a user.
     * @param token The refresh token string to revoke.
     * @returns {Promise<void>} A promise that resolves when the token is revoked.
     */
    revokeRefreshToken(token: string): Promise<void>;
    /**
     * Removes expired refresh tokens from the database.
     * @returns {Promise<void>} A promise that resolves when the expired tokens are removed.
     */
    removeExpiredRefreshTokens(): Promise<void>;
}
