import {
    Controller,
    Inject,
    UseGuards,
    Get,
    Post,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    NotFoundException,
    InternalServerErrorException,
    ForbiddenException,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiOkResponse,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiTooManyRequestsResponse,
    ApiBadRequestResponse,
    ApiForbiddenResponse,
    ApiInternalServerErrorResponse,
    ApiBody,
    ApiParam,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { ITeamInvitesService } from './interfaces/team-invites-service.interfaces.js';
import type { ITeamMembersService } from './interfaces/team-members-service.interfaces.js';
import type { IMailsService } from '../mails/interfaces/mails-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { MessageResponseDto } from '../../common/dto/message-response.dto.js';
import { TeamRoles } from './decorators/team-roles.decorator.js';
import { AuthUser } from '../users/decorators/auth-user.decorator.js';
import { CreateTeamInviteDto } from './dto/create-team-invite.dto.js';
import { AuthenticatedUser } from '../users/dto/auth-user.dto.js';
import { TeamMemberRoles } from './enums/team-member-roles.enum.js';
import { InviteStatus } from './enums/invite-status.enum.js';
import { TeamMemberResponseDto } from './dto/team-member-response.dto.js';
import {
    TeamInviteResponseDto,
    PublicTeamInviteResponseDto,
} from './dto/team-invite-response.dto.js';

@ApiTags('Team Invites')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.TEAMS)
export class TeamInvitesController {
    constructor(
        @Inject(Services.TEAM_INVITES)
        private readonly teamInvitesService: ITeamInvitesService,
        @Inject(Services.TEAM_MEMBERS)
        private readonly teamMembersService: ITeamMembersService,
        @Inject(Services.MAILS)
        private readonly mailsService: IMailsService,
    ) {}

    @Get(':teamId/invites')
    @ApiOkResponse({ type: createCustomResponse(TeamInviteResponseDto, true) })
    @ApiParam({ name: 'teamId', format: 'uuid' })
    async findAll(
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<TeamInviteResponseDto[]> {
        const invites = await this.teamInvitesService.findAllByTeam(teamId);

        return plainToInstance(TeamInviteResponseDto, invites);
    }

    @Get('invites/:token')
    @ApiOkResponse({ type: createCustomResponse(PublicTeamInviteResponseDto) })
    @ApiParam({ name: 'token' })
    async findOne(
        @Param('token') token: string,
    ): Promise<PublicTeamInviteResponseDto> {
        const invite = await this.teamInvitesService.findByToken(token);
        if (!invite) throw new NotFoundException('Invite not found');

        return plainToInstance(PublicTeamInviteResponseDto, invite);
    }

    @Post(':teamId/invites')
    @HttpCode(HttpStatus.OK)
    @TeamRoles(TeamMemberRoles.OWNER, TeamMemberRoles.ADMIN)
    @ApiOkResponse({ type: createCustomResponse(MessageResponseDto) })
    @ApiConflictResponse({ description: 'Invite already exists' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiInternalServerErrorResponse({ description: 'Internal Server Error' })
    @ApiBody({ type: CreateTeamInviteDto })
    @ApiParam({ name: 'teamId', format: 'uuid' })
    async createTeamInvite(
        @Body() { email, memberId }: CreateTeamInviteDto,
        @Param('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<{ message: string }> {
        const { invite, token } = await this.teamInvitesService.createInvite(
            teamId,
            email,
            memberId,
        );

        try {
            await this.mailsService.teamInvite({
                to: email,
                data: { token },
            });
        } catch {
            await this.teamInvitesService.revokeInvite(invite.id);
            throw new InternalServerErrorException(
                'Failed to send team invite email. Please try again later.',
            );
        }

        return { message: 'Invite sent successfully' };
    }

    @Post('invites/:token/accept')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: createCustomResponse(TeamMemberResponseDto) })
    @ApiNotFoundResponse({ description: 'Invite not found' })
    @ApiBadRequestResponse({ description: 'Invite expired' })
    @ApiParam({ name: 'token' })
    async acceptInvite(
        @AuthUser() AuthUser: AuthenticatedUser,
        @Param('token') token: string,
    ): Promise<TeamMemberResponseDto> {
        const invite = await this.teamInvitesService.verifyInvite(
            AuthUser.email,
            token,
        );

        const [addedMember] = await Promise.all([
            this.teamMembersService.addTeamMember(invite.team.id, {
                userId: AuthUser.id,
                role: TeamMemberRoles.MEMBER,
            }),
            this.teamInvitesService.updateInviteStatus(
                invite,
                InviteStatus.ACCEPTED,
            ),
        ]);

        return plainToInstance(TeamMemberResponseDto, addedMember);
    }

    @Post('invites/:token/reject')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({ type: createCustomResponse(MessageResponseDto) })
    @ApiNotFoundResponse({ description: 'Invite not found' })
    @ApiBadRequestResponse({ description: 'Invite expired' })
    @ApiParam({ name: 'token' })
    async rejectInvite(
        @AuthUser() AuthUser: AuthenticatedUser,
        @Param('token') token: string,
    ): Promise<{ message: string }> {
        const invite = await this.teamInvitesService.verifyInvite(
            AuthUser.email,
            token,
        );

        await this.teamInvitesService.updateInviteStatus(
            invite,
            InviteStatus.REJECTED,
        );

        return { message: 'Invite rejected successfully' };
    }

    @Delete(':teamId/invites/:inviteId')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiNotFoundResponse({ description: 'Invite not found' })
    @ApiForbiddenResponse({ description: 'Forbidden' })
    @ApiParam({ name: 'teamId', format: 'uuid' })
    @ApiParam({ name: 'inviteId', format: 'uuid' })
    async removeInvite(
        @AuthUser() { id: userId }: AuthenticatedUser,
        @Param('teamId', ParseUUIDPipe) teamId: string,
        @Param('inviteId', ParseUUIDPipe) inviteId: string,
    ): Promise<void> {
        const invite = await this.teamInvitesService.findById(teamId, inviteId);
        if (!invite) throw new NotFoundException('Invite not found');

        const member = await this.teamMembersService.findByUserId(
            teamId,
            userId,
        );
        if (!member)
            throw new NotFoundException('You are not a member of this team');

        if (
            invite.inviter.user.id !== userId &&
            member.role === TeamMemberRoles.MEMBER
        )
            throw new ForbiddenException(
                'You are not authorized to remove this invite',
            );

        await this.teamInvitesService.revokeInvite(inviteId);
    }
}
