import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITeamsService } from './interfaces/teams-service.interfaces.js';
import { Team } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { createSlug } from '../../common/utils/slug.util.js';
import { TeamMemberRoles } from './enums/team-member-roles.enum.js';

@Injectable()
export class TeamsService implements ITeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
    ) {}

    private async saveTeam(team: Team): Promise<Team> {
        return this.teamsRepository.save(team);
    }

    async findAllByUser(userId: string): Promise<Team[]> {
        return this.teamsRepository.find({
            where: { teamMembers: { user: { id: userId } } },
            order: { createdAt: 'DESC' },
        });
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
                ...createTeamDto,
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

        const updatedTeam = this.teamsRepository.merge(team, {
            ...updateTeamDto,
            ...(updateTeamDto.name && { slug: createSlug(updateTeamDto.name) }),
        });

        return this.saveTeam(updatedTeam);
    }

    async deleteTeam(id: string): Promise<void> {
        await this.teamsRepository.softDelete(id);
    }
}
