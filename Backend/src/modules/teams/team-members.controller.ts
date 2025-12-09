import {
    Controller,
    Inject,
    UseGuards,
    Get,
    Post,
    Delete,
    Patch,
    Body,
    Param,
    ParseUUIDPipe,
    NotFoundException,
    HttpCode,
    HttpStatus,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiUnauthorizedResponse,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
    ApiBody,
    ApiForbiddenResponse,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { ITeamMembersService } from './interfaces/team-members-service.interfaces.js';
import type { ITeamsService } from './interfaces/teams-service.interfaces.js';
import { CustomResponse } from '../../common/dto/custom-response.dto.js';
import { TeamMemberResponseDto } from './dto/team-member-response.dto.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';
import { AuthUser } from '../users/decorators/auth-user.decorator.js';
import { AuthenticatedUser } from '../users/dto/auth-user.dto.js';
import { TeamMemberRoles } from './enums/team-member-roles.enum.js';

@ApiTags('Team Members')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiParam({ name: 'teamId' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.TEAM_MEMBERS)
export class TeamMembersController {
    constructor(
        @Inject(Services.TEAM_MEMBERS)
        private readonly teamMembersService: ITeamMembersService,
        @Inject(Services.TEAMS) private readonly teamsService: ITeamsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: CustomResponse<TeamMemberResponseDto[]> })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async findAll(
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<TeamMemberResponseDto[]> {
        const team = await this.teamsService.findOne(teamId);
        if (!team) throw new NotFoundException('Team not found');

        const members = await this.teamMembersService.findAll(teamId);
        return plainToInstance(TeamMemberResponseDto, members);
    }

    @Get(':memberId')
    @ApiOkResponse({ type: CustomResponse<TeamMemberResponseDto> })
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiParam({ name: 'memberId' })
    async findOne(
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<TeamMemberResponseDto> {
        const member = await this.teamMembersService.findById(teamId, memberId);
        if (!member) throw new NotFoundException('Member not found');

        return plainToInstance(TeamMemberResponseDto, member);
    }

    @Post()
    @ApiOkResponse({ type: CustomResponse<TeamMemberResponseDto> })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiConflictResponse({ description: 'Member already exists' })
    @ApiBody({ type: AddTeamMemberDto })
    async addTeamMember(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<TeamMemberResponseDto> {
        if (userId === addTeamMemberDto.userId) {
            throw new ForbiddenException('You are not allowed to add yourself');
        }

        const user = await this.teamMembersService.findByUserId(teamId, userId);
        if (!user) {
            throw new NotFoundException('You are not a member of this team');
        }

        const hasPermission = this.teamMembersService.checkRolePriority(
            user.role,
            TeamMemberRoles.ADMIN,
        );

        if (!hasPermission)
            throw new ForbiddenException('You are not allowed to add members');

        const team = await this.teamsService.findOne(teamId);
        if (!team) throw new NotFoundException('Team not found');

        const member = await this.teamMembersService.addTeamMember(
            teamId,
            addTeamMemberDto,
        );

        return plainToInstance(TeamMemberResponseDto, member);
    }

    @Patch(':memberId')
    @ApiOkResponse({ type: CustomResponse<TeamMemberResponseDto> })
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiBody({ type: UpdateTeamMemberDto })
    @ApiParam({ name: 'memberId' })
    async updateTeamMemberRole(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Body() { role }: UpdateTeamMemberDto,
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<TeamMemberResponseDto> {
        const [user, member] = await Promise.all([
            this.teamMembersService.findByUserId(teamId, userId),
            this.teamMembersService.findById(teamId, memberId),
        ]);

        if (!user) {
            throw new ForbiddenException('You are not a member of this team');
        }
        if (!member) {
            throw new NotFoundException('Member not found');
        }
        if (member.user.id === userId) {
            throw new ForbiddenException(
                'You are not allowed to update your role',
            );
        }

        const hasPriority = this.teamMembersService.checkRolePriority(
            user.role,
            member.role,
            true,
        );
        const hasPermission = this.teamMembersService.checkRolePriority(
            user.role,
            role,
            true,
        );

        if (!hasPriority || !hasPermission)
            throw new ForbiddenException(
                'You are not allowed to update this member',
            );

        const updatedMember =
            await this.teamMembersService.updateTeamMemberRole(member, role);

        return plainToInstance(TeamMemberResponseDto, updatedMember);
    }

    @Delete(':memberId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiParam({ name: 'memberId' })
    async removeTeamMember(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<void> {
        const [user, member] = await Promise.all([
            this.teamMembersService.findByUserId(teamId, userId),
            this.teamMembersService.findById(teamId, memberId),
        ]);

        if (!user) {
            throw new ForbiddenException('You are not a member of this team');
        }
        if (!member) {
            throw new NotFoundException('Member not found');
        }
        if (
            member.user.id === userId &&
            member.role === TeamMemberRoles.OWNER
        ) {
            throw new ForbiddenException(
                'You are the owner of this team, you cannot remove yourself',
            );
        }

        const hasPermission = this.teamMembersService.checkRolePriority(
            user.role,
            member.role,
            false,
        );

        if (!hasPermission)
            throw new ForbiddenException(
                'You are not allowed to remove this member',
            );

        await this.teamMembersService.removeTeamMember(teamId, memberId);
    }
}
