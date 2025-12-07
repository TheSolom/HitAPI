import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ITeamsService } from './interfaces/teams-service.interfaces.js';
import { Team } from './entities/team.entity.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import { createSlug } from '../../common/utils/slug.util.js';
import { OffsetPaginationDto } from '../../common/dto/offset-pagination.dto.js';

@Injectable()
export class TeamsService implements ITeamsService {
    constructor(
        @InjectRepository(Team)
        private readonly teamsRepository: Repository<Team>,
    ) {}

    private async saveTeam(team: Team): Promise<Team> {
        return this.teamsRepository.save(team);
    }

    async findAll(
        offset: number,
        limit: number,
    ): Promise<OffsetPaginationDto<Team>> {
        const skip = (offset - 1) * limit;

        const [teams, totalItems] = await this.teamsRepository.findAndCount({
            skip,
            take: limit,
        });

        return {
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            items: teams,
        };
    }

    async findOne(id: string): Promise<NullableType<Team>> {
        const team = await this.teamsRepository.findOne({
            where: { id },
            relations: ['teamMembers', 'teamMembers.user'],
        });
        return team;
    }

    async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
        const slug = createSlug(createTeamDto.name);

        const existingTeam = await this.teamsRepository.findOneBy({ slug });
        if (existingTeam) throw new ConflictException('Team already exists');

        return this.saveTeam(
            this.teamsRepository.create({
                ...createTeamDto,
                slug,
            }),
        );
    }

    async updateTeam(id: string, updateTeamDto: UpdateTeamDto): Promise<Team> {
        const slug = updateTeamDto.name && createSlug(updateTeamDto.name);

        return this.saveTeam(
            this.teamsRepository.create({
                id,
                ...(slug && { slug }),
                ...updateTeamDto,
            }),
        );
    }

    async deleteTeam(id: string): Promise<void> {
        await this.teamsRepository.softDelete(id);
    }
}
