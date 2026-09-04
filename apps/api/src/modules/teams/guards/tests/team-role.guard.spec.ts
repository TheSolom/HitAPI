import { jest } from '@jest/globals';
import { Reflector } from '@nestjs/core';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { TeamMemberRoles } from '@hitapi/types';
import { TeamRoleGuard } from '../team-role.guard.js';
import type { ITeamMembersService } from '../../interfaces/team-members-service.interfaces.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

describe('TeamRoleGuard', () => {
    let guard: TeamRoleGuard;
    let reflectorMock: {
        getAllAndOverride: jest.Mock<any>;
    };
    let teamMembersServiceMock: {
        findByUserId: jest.Mock<any>;
    };

    const validTeamUuid = '123e4567-e89b-12d3-a456-426614174000';

    const createMockExecutionContext = (
        params: Record<string, string | undefined> = {},
        user?: Partial<AuthenticatedUser>,
    ): ExecutionContext => {
        const req = {
            params,
            user: Object.assign(
                new AuthenticatedUser(),
                user ?? { id: 'user-1' },
            ),
        };
        return {
            getHandler: () => ({}),
            getClass: () => ({}),
            switchToHttp: () => ({
                getRequest: () => req,
            }),
        } as unknown as ExecutionContext;
    };

    beforeEach(() => {
        reflectorMock = {
            getAllAndOverride: jest.fn<any>(),
        };
        teamMembersServiceMock = {
            findByUserId: jest.fn<any>(),
        };
        guard = new TeamRoleGuard(
            reflectorMock as unknown as Reflector,
            teamMembersServiceMock as unknown as ITeamMembersService,
        );
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should return true if no required roles are defined by decorator', async () => {
        reflectorMock.getAllAndOverride.mockReturnValue(undefined);
        const context = createMockExecutionContext();

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should throw BadRequestException if teamId is missing or invalid UUID format', async () => {
        reflectorMock.getAllAndOverride.mockReturnValue([
            TeamMemberRoles.ADMIN,
        ]);
        const context = createMockExecutionContext({ teamId: 'not-a-uuid' });

        await expect(guard.canActivate(context)).rejects.toThrow(
            new BadRequestException('Invalid team ID format'),
        );
    });

    it('should throw ForbiddenException if user is not a member of the team', async () => {
        reflectorMock.getAllAndOverride.mockReturnValue([
            TeamMemberRoles.ADMIN,
        ]);
        const context = createMockExecutionContext({ teamId: validTeamUuid });
        teamMembersServiceMock.findByUserId.mockResolvedValue(null);

        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException('You are not a member of this team'),
        );
    });

    it('should return true when member has sufficient role priority (Owner satisfies Admin role)', async () => {
        reflectorMock.getAllAndOverride.mockReturnValue([
            TeamMemberRoles.ADMIN,
        ]);
        const context = createMockExecutionContext({ teamId: validTeamUuid });
        teamMembersServiceMock.findByUserId.mockResolvedValue({
            role: TeamMemberRoles.OWNER,
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(true);
    });

    it('should return false when member has lower role priority than required', async () => {
        reflectorMock.getAllAndOverride.mockReturnValue([
            TeamMemberRoles.ADMIN,
        ]);
        const context = createMockExecutionContext({ teamId: validTeamUuid });
        teamMembersServiceMock.findByUserId.mockResolvedValue({
            role: TeamMemberRoles.MEMBER,
        });

        const result = await guard.canActivate(context);
        expect(result).toBe(false);
    });
});
