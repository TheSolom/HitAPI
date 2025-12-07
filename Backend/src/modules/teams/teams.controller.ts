import {
    Controller,
    Inject,
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
} from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
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
@Controller('teams')
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
    async createTeam(
        @Body() createTeamDto: CreateTeamDto,
    ): Promise<TeamResponseDto> {
        const team = await this.teamsService.createTeam(createTeamDto);

        return plainToInstance(TeamResponseDto, team);
    }

    @Patch(':id')
    @ApiOkResponse({ type: CustomResponse<TeamResponseDto> })
    @ApiNotFoundResponse({ description: 'Team not found' })
    async updateTeam(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateTeamDto: UpdateTeamDto,
    ): Promise<TeamResponseDto> {
        const team = await this.teamsService.updateTeam(id, updateTeamDto);
        if (!team) throw new NotFoundException('Team not found');

        return plainToInstance(TeamResponseDto, team);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    async deleteTeam(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.teamsService.deleteTeam(id);
    }
}
