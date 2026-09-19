import {
    ApiBearerAuth,
    ApiOAuth2,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiOkResponse,
} from '@nestjs/swagger';
import { UseGuards, Controller, Inject, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IPerformanceService } from './interfaces/performance-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { GetPerformanceOptionsDto } from './dto/get-performance-options.dto.js';
import { PerformanceMetricsResponseDto } from './dto/performance-metrics-response.dto.js';
import { ApdexScoreChartResponseDto } from './dto/apdex-score-chart-response.dto.js';
import { ResponseTimeChartResponseDto } from './dto/response-time-chart-response.dto.js';
import { PerformanceEndpointsTableResponseDto } from './dto/performance-endpoints-table-response.dto.js';

@ApiTags('Performance')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.PERFORMANCE)
export class PerformanceController {
    constructor(
        @Inject(Services.PERFORMANCE)
        private readonly performanceService: IPerformanceService,
    ) {}

    @Get('metrics')
    @ApiOkResponse({
        type: createCustomResponse(PerformanceMetricsResponseDto),
    })
    async getPerformanceMetrics(
        @Query() options: GetPerformanceOptionsDto,
    ): Promise<PerformanceMetricsResponseDto> {
        return this.performanceService.getPerformanceMetrics(options);
    }

    @Get('apdex-score-chart')
    @ApiOkResponse({ type: createCustomResponse(ApdexScoreChartResponseDto) })
    async getApdexScoreChart(
        @Query() options: GetPerformanceOptionsDto,
    ): Promise<ApdexScoreChartResponseDto> {
        return this.performanceService.getApdexScoreChart(options);
    }

    @Get('response-time-chart')
    @ApiOkResponse({ type: createCustomResponse(ResponseTimeChartResponseDto) })
    async getResponseTimeChart(
        @Query() options: GetPerformanceOptionsDto,
    ): Promise<ResponseTimeChartResponseDto> {
        return this.performanceService.getResponseTimeChart(options);
    }

    @Get('endpoints-table')
    @ApiOkResponse({
        type: createCustomResponse(PerformanceEndpointsTableResponseDto, true),
    })
    async getPerformanceEndpointsTable(
        @Query() options: GetPerformanceOptionsDto,
    ): Promise<PerformanceEndpointsTableResponseDto[]> {
        return this.performanceService.getPerformanceEndpointsTable(options);
    }
}
