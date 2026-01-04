import {
    Controller,
    Inject,
    UseGuards,
    Get,
    Post,
    Patch,
    Delete,
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
    ApiOkResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiUnauthorizedResponse,
    ApiNotFoundResponse,
    ApiConflictResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
    ApiBody,
    ApiQuery,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IAppsService } from './interfaces/apps-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { CreateAppDto } from './dto/create-app.dto.js';
import { UpdateAppDto } from './dto/update-app.dto.js';
import { AppResponseDto } from './dto/app-response.dto.js';

@ApiTags('Apps')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.APPS)
export class AppsController {
    constructor(
        @Inject(Services.APPS) private readonly appsService: IAppsService,
    ) {}

    @Get()
    @ApiOkResponse({ type: createCustomResponse(AppResponseDto, true) })
    @ApiQuery({ name: 'teamId', format: 'uuid' })
    async listApps(
        @Query('teamId', ParseUUIDPipe) teamId: string,
    ): Promise<AppResponseDto[]> {
        const apps = await this.appsService.findAllByTeam(teamId);

        return plainToInstance(AppResponseDto, apps);
    }

    @Post()
    @ApiCreatedResponse({ type: createCustomResponse(AppResponseDto) })
    @ApiConflictResponse({ description: 'App already exists' })
    @ApiBody({ type: CreateAppDto })
    async createApp(
        @Body() createAppDto: CreateAppDto,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.createApp(createAppDto);

        return plainToInstance(AppResponseDto, app);
    }

    @Get(':id')
    @ApiOkResponse({ type: createCustomResponse(AppResponseDto) })
    @ApiNotFoundResponse({ description: 'App not found' })
    @ApiParam({ name: 'id', format: 'uuid' })
    async getApp(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.findOne(id);
        if (!app) throw new NotFoundException('App not found');

        return plainToInstance(AppResponseDto, app);
    }

    @Patch(':id')
    @ApiOkResponse({ type: createCustomResponse(AppResponseDto) })
    @ApiNotFoundResponse({ description: 'App not found' })
    @ApiBody({ type: UpdateAppDto })
    @ApiParam({ name: 'id', format: 'uuid' })
    async updateApp(
        @Body() updateAppDto: UpdateAppDto,
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<AppResponseDto> {
        const app = await this.appsService.updateApp(id, updateAppDto);

        return plainToInstance(AppResponseDto, app);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiNoContentResponse()
    @ApiParam({ name: 'id', format: 'uuid' })
    async deleteApp(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        await this.appsService.deleteApp(id);
    }
}
