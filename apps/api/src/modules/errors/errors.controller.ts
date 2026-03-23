import { Controller, Get, Query, UseGuards, Inject } from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOAuth2,
    ApiOkResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Routes } from '../../common/constants/routes.constant.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IErrorsService } from './interfaces/errors-service.interface.js';
import type { IValidationErrorsService } from './interfaces/validation-errors-service.interface.js';
import type { IServerErrorsService } from './interfaces/server-errors-service.interface.js';
import { createCustomResponse } from '../../common/utils/create-custom-response.util.js';
import { GetErrorOptionsDto } from './dto/get-error-options.dto.js';
import { ErrorMetricsResponseDto } from './dto/error-metrics-response.dto.js';
import { ErrorsChartResponseDto } from './dto/errors-chart-response.dto.js';
import { ErrorsByConsumerChartResponseDto } from './dto/errors-by-consumer-chart-response.dto.js';
import { ErrorRatesChartResponseDto } from './dto/error-rates-chart-response.dto.js';
import { ErrorsTableResponseDto } from './dto/errors-table-response.dto.js';
import { ErrorDetailsResponseDto } from './dto/error-details-response.dto.js';
import { GetValidationAndServerErrorOptionsDto } from './dto/get-validation-and-server-error-options.dto.js';
import { ValidationErrorsTableResponseDto } from './dto/validation-errors-table-response.dto.js';
import { ServerErrorsTableResponseDto } from './dto/server-errors-table-response.dto.js';

@ApiTags('Errors')
@ApiBearerAuth('JWT')
@ApiOAuth2(['email', 'profile'], 'GoogleOAuth2')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiTooManyRequestsResponse({ description: 'Too Many Requests' })
@UseGuards(JwtAuthGuard)
@Controller(Routes.ERRORS)
export class ErrorsController {
    constructor(
        @Inject(Services.ERRORS)
        private readonly errorsService: IErrorsService,
        @Inject(Services.SERVER_ERRORS)
        private readonly serverErrorsService: IServerErrorsService,
        @Inject(Services.VALIDATION_ERRORS)
        private readonly validationErrorsService: IValidationErrorsService,
    ) {}

    @Get('metrics')
    @ApiOkResponse({ type: createCustomResponse(ErrorMetricsResponseDto) })
    async getErrorsMetrics(
        @Query() getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorMetricsResponseDto> {
        return this.errorsService.getErrorMetrics(getErrorOptionsDto);
    }

    @Get('chart')
    @ApiOkResponse({ type: createCustomResponse(ErrorsChartResponseDto, true) })
    async getErrorsChart(
        @Query() getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsChartResponseDto[]> {
        return this.errorsService.getErrorsChart(getErrorOptionsDto);
    }

    @Get('by-consumer-chart')
    @ApiOkResponse({
        type: createCustomResponse(ErrorsByConsumerChartResponseDto),
    })
    async getErrorsByConsumerChart(
        @Query() getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsByConsumerChartResponseDto> {
        return this.errorsService.getErrorsByConsumerChart(getErrorOptionsDto);
    }

    @Get('error-rates-chart')
    @ApiOkResponse({
        type: createCustomResponse(ErrorRatesChartResponseDto, true),
    })
    async getErrorRatesChart(@Query() getErrorOptionsDto: GetErrorOptionsDto) {
        return this.errorsService.getErrorRatesChart(getErrorOptionsDto);
    }

    @Get('table')
    @ApiOkResponse({
        type: createCustomResponse(ErrorsTableResponseDto, true),
    })
    async getErrorsTable(@Query() getErrorOptionsDto: GetErrorOptionsDto) {
        return this.errorsService.getErrorsTable(getErrorOptionsDto);
    }

    @Get('details')
    @ApiOkResponse({ type: createCustomResponse(ErrorDetailsResponseDto) })
    async getErrorDetails(@Query() getErrorOptionsDto: GetErrorOptionsDto) {
        return this.errorsService.getErrorDetails(getErrorOptionsDto);
    }

    @Get('validation-errors-table')
    @ApiOkResponse({
        type: createCustomResponse(ValidationErrorsTableResponseDto, true),
    })
    async getValidationErrorsTable(
        @Query() getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ) {
        return this.validationErrorsService.getValidationErrorsTable(
            getErrorOptionsDto,
        );
    }

    @Get('server-errors-table')
    @ApiOkResponse({
        type: createCustomResponse(ServerErrorsTableResponseDto, true),
    })
    async getServerErrorsTable(
        @Query() getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ) {
        return this.serverErrorsService.getServerErrorsTable(
            getErrorOptionsDto,
        );
    }
}
