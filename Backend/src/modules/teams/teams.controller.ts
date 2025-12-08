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
    Query,
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
    ApiParam,
    ApiBody,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { ITeamsService } from './interfaces/teams-service.interfaces.js';
import { OffsetPaginationOptionsDto } from '../../common/dto/offset-pagination-options.dto.js';
import { CustomResponse } from '../../common/dto/custom-response.dto.js';
import { CreateTeamDto } from './dto/create-team.dto.js';
import { UpdateTeamDto } from './dto/update-team.dto.js';
import { TeamResponseDto } from './dto/team-response.dto.js';
import { PaginatedTeamResponseDto } from './dto/paginated-team-response.dto.js';

@ApiTags('Teams')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.TEAMS)
export class TeamsController {
    constructor(
        @Inject(Services.TEAMS) private readonly teamsService: ITeamsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: CustomResponse<PaginatedTeamResponseDto> })
    async findAll(
        @Query() { offset, limit }: OffsetPaginationOptionsDto,
    ): Promise<PaginatedTeamResponseDto> {
        const teams = await this.teamsService.findAll(offset, limit);

        return plainToInstance(PaginatedTeamResponseDto, teams);
    }

    @Get(':id')
    @ApiOkResponse({ type: CustomResponse<TeamResponseDto> })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiParam({ name: 'id' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<TeamResponseDto> {
        const team = await this.teamsService.findOne(id);
        if (!team) throw new NotFoundException('Team not found');

        return plainToInstance(TeamResponseDto, team);
    }

    @Post()
    @ApiOkResponse({ type: CustomResponse<TeamResponseDto> })
    @ApiConflictResponse({ description: 'Team already exists' })
    @ApiBody({ type: CreateTeamDto })
    async createTeam(
        @Body() createTeamDto: CreateTeamDto,
    ): Promise<TeamResponseDto> {
        const team = await this.teamsService.createTeam(createTeamDto);

        return plainToInstance(TeamResponseDto, team);
    }

    @Patch(':id')
    @ApiOkResponse({ type: CustomResponse<TeamResponseDto> })
    @ApiNotFoundResponse({ description: 'Team not found' })
    @ApiBody({ type: UpdateTeamDto })
    @ApiParam({ name: 'id' })
    async updateTeam(
        @Body() updateTeamDto: UpdateTeamDto,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<TeamResponseDto> {
        const team = await this.teamsService.updateTeam(id, updateTeamDto);
        if (!team) throw new NotFoundException('Team not found');

        return plainToInstance(TeamResponseDto, team);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiParam({ name: 'id' })
    async deleteTeam(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.teamsService.deleteTeam(id);
    }
}
