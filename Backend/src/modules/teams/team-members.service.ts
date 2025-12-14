import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import type { ITeamMembersService } from './interfaces/team-members-service.interfaces.js';
import { TeamMember } from './entities/team-member.entity.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import { TeamMemberRolePriority } from './enums/team-member-roles.enum.js';

@Injectable()
export class TeamMembersService implements ITeamMembersService {
    constructor(
        @InjectRepository(TeamMember)
        private readonly teamMembersRepository: Repository<TeamMember>,
    ) {}

    private async saveTeamMember(teamMember: TeamMember): Promise<TeamMember> {
        return this.teamMembersRepository.save(teamMember);
    }

    async findAll(teamId: TeamMember['team']['id']): Promise<TeamMember[]> {
        return this.teamMembersRepository.find({
            where: { team: { id: teamId } },
            order: { joinedAt: 'ASC', user: { email: 'ASC' } },
            relations: ['user'],
        });
    }

    async findById(
        teamId: TeamMember['team']['id'],
        memberId: TeamMember['id'],
    ): Promise<NullableType<TeamMember>> {
        return this.teamMembersRepository.findOne({
            where: { team: { id: teamId }, id: memberId },
            relations: ['user'],
        });
    }

    async findByUserId(
        teamId: TeamMember['team']['id'],
        userId: TeamMember['user']['id'],
    ): Promise<NullableType<TeamMember>> {
        return this.teamMembersRepository.findOne({
            where: { team: { id: teamId }, user: { id: userId } },
            relations: ['user'],
        });
    }

    async searchTeamMembers(
        teamId: TeamMember['team']['id'],
        search: string,
    ): Promise<TeamMember[]> {
        return this.teamMembersRepository.find({
            where: [
                {
                    team: { id: teamId },
                    user: { displayName: ILike(`%${search}%`) },
                },
                {
                    team: { id: teamId },
                    user: { email: ILike(`%${search}%`) },
                },
            ],
            relations: ['user'],
        });
    }

    async addTeamMember(
        teamId: TeamMember['team']['id'],
        addTeamMemberDto: AddTeamMemberDto,
    ): Promise<TeamMember> {
        const existingMember = await this.findByUserId(
            teamId,
            addTeamMemberDto.userId,
        );
        if (existingMember) {
            throw new ConflictException('Member already exists');
        }

        return this.saveTeamMember(
            this.teamMembersRepository.create({
                team: { id: teamId },
                user: { id: addTeamMemberDto.userId },
                role: addTeamMemberDto.role,
            }),
        );
    }

    checkRolePriority(
        updaterRole: TeamMember['role'],
        role: TeamMember['role'],
        equality: boolean = true,
    ): boolean {
        return (
            TeamMemberRolePriority[updaterRole] <=
            (equality
                ? TeamMemberRolePriority[role]
                : TeamMemberRolePriority[role] - 1)
        );
    }

    async updateTeamMemberRole(
        member: TeamMember,
        role: TeamMember['role'],
    ): Promise<TeamMember> {
        member.role = role;
        return this.saveTeamMember(member);
    }

    async removeTeamMember(
        teamId: TeamMember['team']['id'],
        memberId: TeamMember['id'],
    ): Promise<void> {
        await this.teamMembersRepository.softDelete({
            team: { id: teamId },
            id: memberId,
        });
    }
}
