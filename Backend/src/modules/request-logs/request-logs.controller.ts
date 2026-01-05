import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Inject,
    Header,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOAuth2,
    ApiUnauthorizedResponse,
    ApiTooManyRequestsResponse,
    ApiParam,
    ApiOkResponse,
    ApiQuery,
    ApiProduces,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Routes } from '../../common/constants/routes.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IRequestLogsService } from './interfaces/request-logs-service.interface.js';
import { GetRequestLogsOptionsDto } from './dto/get-request-logs-options.dto.js';
import { GetRequestLogTimelineOptionsDto } from './dto/get-request-log-timeline-options.dto.js';
import {
    RequestLogResponseDto,
    RequestLogResponsePaginatedDto,
} from './dto/request-log-response.dto.js';
import { RequestLogDetailsResponseDto } from './dto/request-log-details-response.dto.js';
import { RequestLogTimelineResponseDto } from './dto/request-log-timeline-response.dto.js';
import { ApplicationLogResponseDto } from './dto/application-log-response.dto.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { SkipResponseInterceptor } from '../../common/decorators/skip-response-interceptor.decorator.js';

@ApiTags('Request Logs')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.REQUEST_LOGS)
export class RequestLogsController {
    constructor(
        @Inject(Services.REQUEST_LOGS)
        private readonly requestLogsService: IRequestLogsService,
    ) {}

    @Get()
    @ApiOkResponse({
        type: createCustomResponse(RequestLogResponseDto, true),
    })
    async getRequestLogs(
        @Query() getRequestLogsDto: GetRequestLogsOptionsDto,
    ): Promise<RequestLogResponsePaginatedDto> {
        return this.requestLogsService.getRequestLogs(getRequestLogsDto);
    }

    @Get('timeline')
    @ApiOkResponse({
        type: createCustomResponse(RequestLogTimelineResponseDto),
    })
    async getRequestLogsTimeline(
        @Query() getRequestLogTimelineDto: GetRequestLogTimelineOptionsDto,
    ): Promise<RequestLogTimelineResponseDto> {
        return this.requestLogsService.getRequestLogsTimeline(
            getRequestLogTimelineDto,
        );
    }

    @Get('export')
    @SkipResponseInterceptor()
    @Header('Content-Type', 'text/csv')
    @Header('Content-Disposition', 'attachment; filename="request-logs.csv"')
    @ApiProduces('text/csv')
    @ApiOkResponse({ type: 'string' })
    async exportRequestLogsCsv(
        @Query() getRequestLogsDto: GetRequestLogsOptionsDto,
    ): Promise<string> {
        return this.requestLogsService.exportRequestLogsCsv(getRequestLogsDto);
    }

    @Get(':requestUuid')
    @ApiOkResponse({ type: createCustomResponse(RequestLogDetailsResponseDto) })
    @ApiParam({ name: 'requestUuid', format: 'uuid' })
    @ApiQuery({ name: 'appId', format: 'uuid' })
    @ApiQuery({ name: 'timestamp', format: 'date-time', required: false })
    async getRequestLogDetails(
        @Param('requestUuid', ParseUUIDPipe) requestUuid: string,
        @Query('appId', ParseUUIDPipe) appId: string,
        @Query('timestamp') timestamp?: string,
    ): Promise<RequestLogDetailsResponseDto> {
        return this.requestLogsService.getRequestLogDetails(
            requestUuid,
            appId,
            timestamp,
        );
    }

    @Get(':requestUuid/logs')
    @ApiOkResponse({
        type: createCustomResponse(ApplicationLogResponseDto, true),
    })
    @ApiParam({ name: 'requestUuid', format: 'uuid' })
    @ApiQuery({ name: 'appId', format: 'uuid' })
    async getRequestLogApplicationLogs(
        @Param('requestUuid', ParseUUIDPipe) requestUuid: string,
        @Query('appId', ParseUUIDPipe) appId: string,
    ): Promise<ApplicationLogResponseDto[]> {
        const logs = await this.requestLogsService.getRequestLogApplicationLogs(
            requestUuid,
            appId,
        );

        return plainToInstance(ApplicationLogResponseDto, logs);
    }
}
