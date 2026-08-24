import {
    ConflictException,
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { type NullableType, TeamMemberRoles } from '@hitapi/types';
import type { ITeamMembersService } from './interfaces/team-members-service.interfaces.js';
import { TeamMember } from './entities/team-member.entity.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import { TeamMemberRolePriority } from './enums/team-member-role-priority.enum.js';

@Injectable()
export class TeamMembersService implements ITeamMembersService {
    constructor(
        @InjectRepository(TeamMember)
        private readonly teamMembersRepository: Repository<TeamMember>,
    ) {}

    private async saveTeamMember(teamMember: TeamMember): Promise<TeamMember> {
        return this.teamMembersRepository.save(teamMember);
    }

    async findAllByTeam(
        teamId: TeamMember['team']['id'],
    ): Promise<TeamMember[]> {
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
        invokerUserId?: string,
    ): Promise<TeamMember> {
        if (invokerUserId) {
            if (invokerUserId === addTeamMemberDto.userId) {
                throw new ForbiddenException(
                    'You are not allowed to add yourself',
                );
            }

            const invoker = await this.findByUserId(teamId, invokerUserId);
            if (!invoker) {
                throw new NotFoundException(
                    'You are not a member of this team',
                );
            }

            const hasPermission = this.checkRolePriority(
                invoker.role,
                TeamMemberRoles.ADMIN,
            );
            if (!hasPermission) {
                throw new ForbiddenException(
                    'You are not allowed to add members',
                );
            }
        }

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
        invokerUserId: string,
        teamId: TeamMember['team']['id'],
        memberId: TeamMember['id'],
        role: TeamMember['role'],
    ): Promise<TeamMember> {
        const [invoker, member] = await Promise.all([
            this.findByUserId(teamId, invokerUserId),
            this.findById(teamId, memberId),
        ]);

        if (!invoker) {
            throw new ForbiddenException('You are not a member of this team');
        }
        if (!member) {
            throw new NotFoundException('Member not found');
        }

        const isSelf = member.user.id === invokerUserId;

        if (isSelf) {
            const isSelfPromoting =
                TeamMemberRolePriority[role] <
                TeamMemberRolePriority[member.role];
            if (isSelfPromoting) {
                throw new ForbiddenException(
                    'You are not allowed to promote yourself',
                );
            }
        } else {
            const hasPriority = this.checkRolePriority(
                invoker.role,
                member.role,
                invoker.role === TeamMemberRoles.OWNER,
            );
            const hasPermission = this.checkRolePriority(
                invoker.role,
                role,
                invoker.role === TeamMemberRoles.OWNER,
            );

            if (!hasPriority || !hasPermission) {
                throw new ForbiddenException(
                    'You are not allowed to update this member',
                );
            }
        }

        if (
            member.role === TeamMemberRoles.OWNER &&
            role !== TeamMemberRoles.OWNER
        ) {
            const allMembers = await this.findAllByTeam(teamId);
            const ownerCount = allMembers.filter(
                (m) => m.role === TeamMemberRoles.OWNER,
            ).length;
            if (ownerCount <= 1) {
                throw new BadRequestException(
                    'Cannot demote the sole owner of the team. Transfer ownership or promote another owner first.',
                );
            }
        }

        member.role = role;
        return this.saveTeamMember(member);
    }

    async removeTeamMember(
        invokerUserId: string,
        teamId: TeamMember['team']['id'],
        memberId: TeamMember['id'],
    ): Promise<void> {
        const [invoker, member] = await Promise.all([
            this.findByUserId(teamId, invokerUserId),
            this.findById(teamId, memberId),
        ]);

        if (!invoker) {
            throw new ForbiddenException('You are not a member of this team');
        }
        if (!member) {
            throw new NotFoundException('Member not found');
        }

        const isSelf = member.user.id === invokerUserId;

        if (member.role === TeamMemberRoles.OWNER) {
            const allMembers = await this.findAllByTeam(teamId);
            const ownerCount = allMembers.filter(
                (m) => m.role === TeamMemberRoles.OWNER,
            ).length;
            if (ownerCount <= 1) {
                throw new BadRequestException(
                    'Cannot remove the sole owner of the team. Transfer ownership or delete the team.',
                );
            }
        }

        if (!isSelf) {
            const hasPermission = this.checkRolePriority(
                invoker.role,
                member.role,
                invoker.role === TeamMemberRoles.OWNER,
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    'You are not allowed to remove this member',
                );
            }
        }

        await this.teamMembersRepository.softDelete({
            team: { id: teamId },
            id: memberId,
        });
    }

    async removeAllByTeam(teamId: TeamMember['team']['id']): Promise<void> {
        await this.teamMembersRepository.softDelete({
            team: { id: teamId },
        });
    }
}
