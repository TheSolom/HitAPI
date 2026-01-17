import type { NullableType } from '../../../common/@types/nullable.type.js';
import { Team } from '../entities/team.entity.js';
import { CreateTeamDto } from '../dto/create-team.dto.js';
import { UpdateTeamDto } from '../dto/update-team.dto.js';

export interface ITeamsService {
    /**
     * Find all teams
     *
     * @param userId
     * @returns {Promise<Team[]>}
     */
    findAllByUser(userId: string): Promise<Team[]>;
    /**
     * Find one team by id
     *
     * @param id
     * @returns {Promise<NullableType<Team>>}
     */
    findOne(id: string): Promise<NullableType<Team>>;
    /**
     * Create a new team
     *
     * @param userId
     * @param CreateTeamDto
     * @returns {Promise<Team>}
     * @throws {ConflictException} Team already exists
     */
    createTeam(userId: string, createTeamDto: CreateTeamDto): Promise<Team>;
    /**
     * Update a team
     *
     * @param id
     * @param updateTeamDto
     * @returns {Promise<Team>}
     */
    updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team>;
    /**
     * Delete a team
     *
     * @param id
     * @returns {Promise<void>}
     */
    deleteTeam(id: string): Promise<void>;
}
