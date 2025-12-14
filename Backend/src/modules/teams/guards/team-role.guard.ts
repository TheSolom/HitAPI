import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { isUUID } from 'class-validator';
import { Services } from '../../../common/constants/services.constant.js';
import type { ITeamMembersService } from '../interfaces/team-members-service.interfaces.js';
import { TEAM_ROLES_KEY } from '../../../common/constants/keys.constant.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import {
    TeamMemberRoles,
    TeamMemberRolePriority,
} from '../enums/team-member-roles.enum.js';

@Injectable()
export class TeamRoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(Services.TEAM_MEMBERS)
        private readonly teamMembersService: ITeamMembersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<
            TeamMemberRoles[]
        >(TEAM_ROLES_KEY, [context.getHandler(), context.getClass()]);

        if (!requiredRoles) return true;

        const request = context.switchToHttp().getRequest<Request>();

        const teamId = request.params.teamId;
        if (!isUUID(teamId)) {
            throw new BadRequestException('Invalid team ID format');
        }

        const userId = (request.user as AuthenticatedUser).id;

        const member = await this.teamMembersService.findByUserId(
            teamId,
            userId,
        );

        if (!member) {
            throw new ForbiddenException('You are not a member of this team');
        }

        return requiredRoles.some(
            (role) =>
                TeamMemberRolePriority[member.role] <=
                TeamMemberRolePriority[role],
        );
    }
}
