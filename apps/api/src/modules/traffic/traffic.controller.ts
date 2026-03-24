import {
    ApiBearerAuth,
    ApiOAuth2,
    ApiTags,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiOkResponse,
    ApiProduces,
} from '@nestjs/swagger';
import {
    UseGuards,
    Controller,
    Inject,
    Get,
    Query,
    Header,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { ITrafficService } from './interfaces/traffic-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { GetTrafficOptionsDto } from './dto/get-traffic-options.dto.js';
import { TrafficMetricsResponseDto } from './dto/traffic-metrics-response.dto.js';
import { RequestsChartResponseDto } from './dto/requests-chart-response.dto.js';
import { RequestsPerMinuteChartResponseDto } from './dto/requests-per-minute-chart-response.dto.js';
import { DataTransferredChartResponseDto } from './dto/data-transferred-chart-response.dto.js';
import { RequestsByConsumerChartResponseDto } from './dto/requests-by-consumer-chart-response.dto.js';
import { GetRequestsByConsumerChartOptionsDto } from './dto/get-requests-by-consumer-chart-options.dto.js';
import { SizeHistogramResponseDto } from './dto/size-histogram-response.dto.js';
import { TrafficEndpointsTableResponseDto } from './dto/traffic-endpoints-table-response.dto.js';
import { StatusCodeCountsResponseDto } from './dto/status-code-counts-response.dto.js';
import { SkipResponseInterceptor } from '../../common/decorators/skip-response-interceptor.decorator.js';
import { ExportTrafficCsvOptionsDto } from './dto/export-traffic-csv-options.dto.js';

@ApiTags('Traffic')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.TRAFFIC)
export class TrafficController {
    constructor(
        @Inject(Services.TRAFFIC)
        private readonly trafficService: ITrafficService,
    ) {}

    @Get('metrics')
    @ApiOkResponse({ type: createCustomResponse(TrafficMetricsResponseDto) })
    async getTrafficMetrics(
        @Query() getTrafficOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getTrafficMetrics(getTrafficOptionsDto);
    }

    @Get('requests-chart')
    @ApiOkResponse({
        type: createCustomResponse(RequestsChartResponseDto, true),
    })
    async getRequestsChart(
        @Query() getRequestsChartOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getRequestsChart(getRequestsChartOptionsDto);
    }

    @Get('requests-per-minute-chart')
    @ApiOkResponse({
        type: createCustomResponse(RequestsPerMinuteChartResponseDto),
    })
    async getRequestsPerMinuteChart(
        @Query() getRequestsPerMinuteChartOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getRequestsPerMinuteChart(
            getRequestsPerMinuteChartOptionsDto,
        );
    }

    @Get('data-transferred-chart')
    @ApiOkResponse({
        type: createCustomResponse(DataTransferredChartResponseDto),
    })
    async getDataTransferredChart(
        @Query() getDataTransferredChartOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getDataTransferredChart(
            getDataTransferredChartOptionsDto,
        );
    }

    @Get('requests-by-consumer-chart')
    @ApiOkResponse({
        type: createCustomResponse(RequestsByConsumerChartResponseDto, true),
    })
    async getRequestsByConsumerChart(
        @Query()
        getRequestsByConsumerChartOptionsDto: GetRequestsByConsumerChartOptionsDto,
    ) {
        return this.trafficService.getRequestsByConsumerChart(
            getRequestsByConsumerChartOptionsDto,
        );
    }

    @Get('request-size-histogram')
    @ApiOkResponse({
        type: createCustomResponse(SizeHistogramResponseDto),
    })
    async getRequestSizeHistogram(
        @Query() getRequestSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getRequestSizeHistogram(
            getRequestSizeHistogramOptionsDto,
        );
    }

    @Get('response-size-histogram')
    @ApiOkResponse({
        type: createCustomResponse(SizeHistogramResponseDto),
    })
    async getResponseSizeHistogram(
        @Query() getResponseSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getResponseSizeHistogram(
            getResponseSizeHistogramOptionsDto,
        );
    }

    @Get('endpoints-table')
    @ApiOkResponse({
        type: createCustomResponse(TrafficEndpointsTableResponseDto, true),
    })
    async getTrafficEndpointsTable(
        @Query() getTrafficEndpointsTableOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getTrafficEndpointsTable(
            getTrafficEndpointsTableOptionsDto,
        );
    }

    @Get('status-code-counts')
    @ApiOkResponse({
        type: createCustomResponse(StatusCodeCountsResponseDto, true),
    })
    async getStatusCodeCounts(
        @Query() getStatusCodeCountsOptionsDto: GetTrafficOptionsDto,
    ) {
        return this.trafficService.getStatusCodeCounts(
            getStatusCodeCountsOptionsDto,
        );
    }

    @Get('export')
    @SkipResponseInterceptor()
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment; filename="traffic.csv"')
    @ApiProduces('text/csv')
    @ApiOkResponse({ type: 'string' })
    async exportTrafficCsv(
        @Query() exportTrafficCsvData: ExportTrafficCsvOptionsDto,
    ): Promise<string> {
        return this.trafficService.exportTrafficCsv(exportTrafficCsvData);
    }
}
