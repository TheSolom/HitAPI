import { RefreshToken } from '../../tokens/entities/refresh-token.entity.js';

export interface ISessionsService {
    /**
     * Retrieves all active sessions for a user.
     * @param userId - The ID of the user.
     * @returns {Promise<RefreshToken[]>} A promise that resolves to an array of active sessions.
     */
    getUserActiveSessions(userId: string): Promise<RefreshToken[]>;
    /**
     * Revokes a specific session by its ID.
     * @param sessionId - The ID of the session to revoke.
     * @returns {Promise<void>} A promise that resolves when the session is revoked.
     */
    revokeSession(sessionId: string): Promise<void>;
    /**
     * Revokes all sessions for a user.
     * @param userId - The ID of the user.
     * @returns {Promise<void>} A promise that resolves when all sessions are revoked.
     */
    revokeAllUserSessions(userId: string): Promise<void>;
}
