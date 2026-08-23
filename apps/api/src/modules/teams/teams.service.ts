import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { type NullableType, TeamMemberRoles } from '@hitapi/types';
import type { ITeamsService } from './interfaces/teams-service.interfaces.js';
import { Team } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { createSlug } from '../../common/utils/slug.util.js';

@Injectable()
export class TeamsService implements ITeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
    ) {}

    private async saveTeam(team: Team): Promise<Team> {
        return this.teamsRepository.save(team);
    }

    private async createDefaultTeamForUser(userId: string): Promise<Team> {
        const baseName = 'Personal';
        let slug = createSlug(baseName);

        const existing = await this.teamsRepository.findOneBy({ slug });
        if (existing) {
            slug = `${slug}-${randomUUID().slice(0, 8)}`;
        }

        const team = this.teamsRepository.create({
            name: baseName,
            slug,
            demo: false,
            stealth: false,
            teamMembers: [
                {
                    user: { id: userId },
                    role: TeamMemberRoles.OWNER,
                },
            ],
        });

        return this.saveTeam(team);
    }

    async findAllByUser(userId: string): Promise<Team[]> {
        const teams = await this.teamsRepository.find({
            where: { teamMembers: { user: { id: userId } } },
            order: { createdAt: 'DESC' },
        });

        if (teams.length === 0) {
            const defaultTeam = await this.createDefaultTeamForUser(userId);
            return [defaultTeam];
        }

        return teams;
    }

    async findOne(id: string): Promise<NullableType<Team>> {
        return this.teamsRepository.findOne({
            where: { id },
            relations: [
                'teamMembers',
                'teamMembers.user',
                'invites',
                'invites.inviter',
            ],
        });
    }

    async createTeam(
        userId: string,
        createTeamDto: CreateTeamDto,
    ): Promise<Team> {
        const slug = createSlug(createTeamDto.name);

        const existingTeam = await this.teamsRepository.findOneBy({ slug });
        if (existingTeam) throw new ConflictException('Team already exists');

        return this.saveTeam(
            this.teamsRepository.create({
                name: createTeamDto.name,
                demo: createTeamDto.demo,
                stealth: createTeamDto.stealth,
                slug,
                teamMembers: [
                    {
                        user: { id: userId },
                        role: TeamMemberRoles.OWNER,
                    },
                ],
            }),
        );
    }

    async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
        const team = await this.teamsRepository.findOneBy({ id });
        if (!team) throw new NotFoundException('Team not found');

        if (updateTeamDto.name) {
            team.name = updateTeamDto.name;
            team.slug = createSlug(updateTeamDto.name);
        }
        if (updateTeamDto.demo !== undefined) {
            team.demo = updateTeamDto.demo;
        }
        if (updateTeamDto.stealth !== undefined) {
            team.stealth = updateTeamDto.stealth;
        }

        return this.saveTeam(team);
    }

    async deleteTeam(id: string): Promise<void> {
        await this.teamsRepository.softDelete(id);
    }
}
