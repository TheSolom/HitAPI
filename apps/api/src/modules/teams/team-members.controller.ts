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
    ApiBadRequestResponse,
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
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { TeamMemberResponseDto } from './dto/team-member-response.dto.js';
import { AddTeamMemberDto } from './dto/add-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';
import { AuthUser } from '../users/decorators/auth-user.decorator.js';
import { AuthenticatedUser } from '../users/dto/auth-user.dto.js';

@ApiTags('Team Members')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@ApiParam({ name: 'teamId', format: 'uuid' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.TEAM_MEMBERS)
export class TeamMembersController {
    constructor(
        @Inject(Services.TEAM_MEMBERS)
        private readonly teamMembersService: ITeamMembersService,
        @Inject(Services.TEAMS) private readonly teamsService: ITeamsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: createCustomResponse(TeamMemberResponseDto, true) })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async findAll(
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<TeamMemberResponseDto[]> {
        const team = await this.teamsService.findOne(teamId);
        if (!team) throw new NotFoundException('Team not found');

        const members = await this.teamMembersService.findAllByTeam(teamId);
        return plainToInstance(TeamMemberResponseDto, members);
    }

    @Get(':memberId')
    @ApiOkResponse({ type: createCustomResponse(TeamMemberResponseDto) })
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiParam({ name: 'memberId', format: 'uuid' })
    async findOne(
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<TeamMemberResponseDto> {
        const member = await this.teamMembersService.findById(teamId, memberId);
        if (!member) throw new NotFoundException('Member not found');

        return plainToInstance(TeamMemberResponseDto, member);
    }

    @Post()
    @ApiOkResponse({ type: createCustomResponse(TeamMemberResponseDto) })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiConflictResponse({ description: 'Member already exists' })
    @ApiBody({ type: AddTeamMemberDto })
    async addTeamMember(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Body() addTeamMemberDto: AddTeamMemberDto,
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<TeamMemberResponseDto> {
        const team = await this.teamsService.findOne(teamId);
        if (!team) throw new NotFoundException('Team not found');

        const member = await this.teamMembersService.addTeamMember(
            teamId,
            addTeamMemberDto,
            userId,
        );

        return plainToInstance(TeamMemberResponseDto, member);
    }

    @Patch(':memberId')
    @ApiOkResponse({ type: createCustomResponse(TeamMemberResponseDto) })
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiBadRequestResponse({ description: 'Cannot demote the sole owner' })
    @ApiBody({ type: UpdateTeamMemberDto })
    @ApiParam({ name: 'memberId', format: 'uuid' })
    async updateTeamMemberRole(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Body() { role }: UpdateTeamMemberDto,
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<TeamMemberResponseDto> {
        const updatedMember =
            await this.teamMembersService.updateTeamMemberRole(
                userId,
                teamId,
                memberId,
                role,
            );

        return plainToInstance(TeamMemberResponseDto, updatedMember);
    }

    @Delete(':memberId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiNotFoundResponse({ description: 'Member not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiBadRequestResponse({ description: 'Cannot remove the sole owner' })
    @ApiParam({ name: 'memberId', format: 'uuid' })
    async removeTeamMember(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('memberId', ParseUUIDPipe) memberId: string,
    ): Promise<void> {
        await this.teamMembersService.removeTeamMember(
            userId,
            teamId,
            memberId,
        );
    }
}
