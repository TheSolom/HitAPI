import {
    ApiBearerAuth,
    ApiOAuth2,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiOkResponse,
} from '@nestjs/swagger';
import {
    UseGuards,
    Controller,
    Inject,
    Get,
    ParseUUIDPipe,
    Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IResourcesService } from './interfaces/resources-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { GetCpuMemoryChartOptionsDto } from './dto/get-cpu-memory-chart-options.dto.js';
import { CpuMemoryChartResponseDto } from './dto/cpu-memory-chart-response.dto.js';
import { ResourcesDto } from './dto/resources.dto.js';

@ApiTags('Resources')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.RESOURCES)
export class ResourcesController {
    constructor(
        @Inject(Services.RESOURCES)
        private readonly resourcesService: IResourcesService,
    ) {}

    @Get('cpu-memory-chart')
    @ApiOkResponse({ type: createCustomResponse(CpuMemoryChartResponseDto) })
    async getCpuMemoryChart(
        @Query() getCpuMemoryChartOptionsDto: GetCpuMemoryChartOptionsDto,
    ): Promise<CpuMemoryChartResponseDto> {
        return this.resourcesService.getCpuMemoryChart(
            getCpuMemoryChartOptionsDto,
        );
    }

    @Get('metrics')
    @ApiOkResponse({
        type: createCustomResponse(ResourcesDto, true),
    })
    async getResourcesMetrics(
        @Query('appId', ParseUUIDPipe) appId: string,
    ): Promise<ResourcesDto[]> {
        return this.resourcesService.getResourcesMetrics(appId);
    }
}
