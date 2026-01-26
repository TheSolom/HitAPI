import type { NullableType } from '../../../common/types/nullable.type.js';
import { TeamInvite } from '../entities/team-invite.entity.js';

export interface ITeamInvitesService {
    /**
     * Find all invites for a team
     *
     * @param teamId
     * @returns {Promise<TeamInvite[]>}
     */
    findAllByTeam(teamId: TeamInvite['team']['id']): Promise<TeamInvite[]>;
    /**
     * Find one invite by id and teamId
     *
     * @param teamId
     * @param id
     * @returns {Promise<NullableType<TeamInvite>>}
     */
    findById(
        teamId: TeamInvite['team']['id'],
        id: TeamInvite['id'],
    ): Promise<NullableType<TeamInvite>>;
    /**
     * Find one invite by email and teamId
     *
     * @param teamId
     * @param email
     * @returns {Promise<NullableType<TeamInvite>>}
     */
    findByEmail(
        teamId: TeamInvite['team']['id'],
        email: TeamInvite['email'],
    ): Promise<NullableType<TeamInvite>>;
    /**
     * Find one invite by token
     *
     * @param token
     * @returns {Promise<NullableType<TeamInvite>>}
     */
    findByToken(token: string): Promise<NullableType<TeamInvite>>;
    /**
     * Create a new invite
     *
     * @param teamId
     * @param inviterId
     * @param email
     * @returns {Promise<{ invite: TeamInvite; token: string }>}
     * @throws {ConflictException} Invite already exists
     */
    createInvite(
        teamId: TeamInvite['team']['id'],
        email: TeamInvite['email'],
        inviterId: TeamInvite['inviter']['id'],
    ): Promise<{ invite: TeamInvite; token: string }>;
    /**
     * Verify an invite
     *
     * @param userEmail
     * @param token
     * @returns {Promise<TeamInvite>}
     * @throws {NotFoundException} Invite not found
     * @throws {BadRequestException} Invite expired
     */
    verifyInvite(userEmail: string, token: string): Promise<TeamInvite>;
    /**
     * Update an invite status
     *
     * @param invite
     * @param status
     * @returns {Promise<TeamInvite>}
     */
    updateInviteStatus(
        invite: TeamInvite,
        status: TeamInvite['status'],
    ): Promise<TeamInvite>;
    /**
     * Revoke an invite
     *
     * @param id
     * @returns {Promise<void>}
     */
    revokeInvite(id: TeamInvite['id']): Promise<void>;
}
