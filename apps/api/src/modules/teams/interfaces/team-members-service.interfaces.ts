import type { NullableType } from '../../../common/types/nullable.type.js';
import { TeamMember } from './../entities/team-member.entity.js';
import { AddTeamMemberDto } from '../dto/add-team-member.dto.js';

export interface ITeamMembersService {
    /**
     * Find all team members
     *
     * @param teamId
     * @returns {Promise<TeamMember[]>}
     */
    findAllByTeam(teamId: string): Promise<TeamMember[]>;
    /**
     * Find one team member by member id
     *
     * @param teamId
     * @param memberId
     * @returns {Promise<NullableType<TeamMember>>}
     */
    findById(
        teamId: string,
        memberId: string,
    ): Promise<NullableType<TeamMember>>;
    /**
     * Find one team member by user id
     *
     * @param teamId
     * @param userId
     * @returns {Promise<NullableType<TeamMember>>}
     */
    findByUserId(
        teamId: string,
        userId: string,
    ): Promise<NullableType<TeamMember>>;
    /**
     * Search team members
     *
     * @param teamId
     * @param search
     * @returns {Promise<TeamMember[]>}
     */
    searchTeamMembers(teamId: string, search: string): Promise<TeamMember[]>;
    /**
     * add a new team member
     *
     * @param teamId
     * @param addTeamMemberDto
     * @returns {Promise<TeamMember>}
     * @throws {ConflictException} Team member already exists
     */
    addTeamMember(
        teamId: TeamMember['team']['id'],
        addTeamMemberDto: AddTeamMemberDto,
    ): Promise<TeamMember>;
    /**
     * check if the user has the permission to affect the team member
     *
     * @param influencerRole
     * @param role
     * @param equality
     * @returns {boolean}
     */
    checkRolePriority(
        influencerRole: TeamMember['role'],
        role: TeamMember['role'],
        equality?: boolean,
    ): boolean;
    /**
     * Update a team member role
     *
     * @param member
     * @param role
     * @returns {Promise<TeamMember>}
     */
    updateTeamMemberRole(
        member: TeamMember,
        role: TeamMember['role'],
    ): Promise<TeamMember>;
    /**
     * Remove a team member
     *
     * @param teamId
     * @param memberId
     * @returns {Promise<void>}
     */
    removeTeamMember(
        teamId: TeamMember['team']['id'],
        memberId: TeamMember['id'],
    ): Promise<void>;
}
