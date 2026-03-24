import { STATUS_CODES } from 'node:http';
import { Inject, Injectable } from '@nestjs/common';
import { stringToInt } from '@hitapi/shared/utils';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { Services } from '../../common/constants/services.constant.js';
import type {
    IErrorsRepository,
    IErrorChart,
    IErrorRateChart,
} from './interfaces/errors-repository.interface.js';
import type { ITrafficMetricsRepository } from '../traffic/interfaces/traffic-metrics-repository.interface.js';
import type { IEndpointConfigsService } from '../endpoints/interfaces/endpoint-configs-service.interface.js';
import type { GetErrorOptionsDto } from './dto/get-error-options.dto.js';
import type { ErrorMetricsResponseDto } from './dto/error-metrics-response.dto.js';
import { calculateRate } from '../../common/utils/rates.util.js';
import type { ErrorsChartResponseDto } from './dto/errors-chart-response.dto.js';
import { ErrorType } from './enums/error-type.enum.js';
import type { ErrorsByConsumerChartResponseDto } from './dto/errors-by-consumer-chart-response.dto.js';
import type { ErrorRatesChartResponseDto } from './dto/error-rates-chart-response.dto.js';
import type { ErrorsTableResponseDto } from './dto/errors-table-response.dto.js';
import type { ErrorDetailsResponseDto } from './dto/error-details-response.dto.js';

@Injectable()
export class ErrorsService {
    constructor(
        @Inject(Repositories.ERRORS)
        private readonly errorsRepository: IErrorsRepository,
        @Inject(Repositories.TRAFFIC_METRICS)
        private readonly trafficMetricsRepository: ITrafficMetricsRepository,
        @Inject(Services.ENDPOINT_CONFIGS)
        private readonly endpointConfigsService: IEndpointConfigsService,
    ) {}

    private hasErrorFilters(getErrorOptionsDto: GetErrorOptionsDto): boolean {
        return Boolean(
            getErrorOptionsDto.consumerId ||
            getErrorOptionsDto.consumerGroupId ||
            getErrorOptionsDto.method ||
            getErrorOptionsDto.path ||
            getErrorOptionsDto.pathExact ||
            getErrorOptionsDto.statusCode,
        );
    }

    private async fetchFilteredMetrics(getErrorOptionsDto: GetErrorOptionsDto) {
        const errorMetrics =
            await this.errorsRepository.getErrorMetricsFiltered(
                getErrorOptionsDto,
            );
        return {
            totalRequestCount: stringToInt(errorMetrics?.totalRequestCount),
            errorMetrics,
        };
    }

    private async fetchUnfilteredMetrics(
        getErrorOptionsDto: GetErrorOptionsDto,
    ) {
        const [errorMetrics, totalRequestCount] = await Promise.all([
            this.errorsRepository.getErrorMetrics(getErrorOptionsDto),
            this.trafficMetricsRepository.getTotalRequests(getErrorOptionsDto),
        ]);
        return { totalRequestCount, errorMetrics };
    }

    async getErrorMetrics(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorMetricsResponseDto> {
        const { totalRequestCount, errorMetrics } = this.hasErrorFilters(
            getErrorOptionsDto,
        )
            ? await this.fetchFilteredMetrics(getErrorOptionsDto)
            : await this.fetchUnfilteredMetrics(getErrorOptionsDto);

        const totalErrorCount = stringToInt(errorMetrics?.totalErrorCount);
        const clientErrorCount = stringToInt(errorMetrics?.clientErrorCount);
        const serverErrorCount = stringToInt(errorMetrics?.serverErrorCount);

        const errorRate = calculateRate(totalErrorCount, totalRequestCount, 2);

        return {
            totalRequestCount,
            totalErrorCount,
            clientErrorCount,
            serverErrorCount,
            errorRate,
        };
    }

    private formatErrorsChartData(
        data: IErrorChart[],
        errorType: ErrorType,
    ): ErrorsChartResponseDto {
        const timeWindowMap = new Map<string, Map<number, number>>();

        data.forEach((row) => {
            const timeWindow = row.timeWindow.toISOString();
            const statusCode = stringToInt(row.statusCode);
            const count = stringToInt(row.requestCount);

            if (!timeWindowMap.has(timeWindow)) {
                timeWindowMap.set(timeWindow, new Map());
            }

            timeWindowMap.get(timeWindow)!.set(statusCode, count);
        });

        const timeWindows = Array.from(timeWindowMap.keys()).sort((a, b) =>
            a.localeCompare(b),
        );
        const requestCounts: number[] = [];
        const statusCodeCounts: [number, number][][] = [];

        timeWindows.forEach((tw) => {
            const statusMap = timeWindowMap.get(tw)!;
            const total = Array.from(statusMap.values()).reduce(
                (sum, count) => sum + count,
                0,
            );
            requestCounts.push(total);

            const codes: [number, number][] = Array.from(statusMap.entries());
            statusCodeCounts.push(codes);
        });

        return {
            errorType,
            timeWindows,
            requestCounts,
            statusCodeCounts,
        };
    }

    async getErrorsChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsChartResponseDto[]> {
        const errors =
            await this.errorsRepository.getErrorsChart(getErrorOptionsDto);

        return [
            this.formatErrorsChartData(
                errors.clientErrors,
                ErrorType.CLIENT_ERROR,
            ),
            this.formatErrorsChartData(
                errors.serverErrors,
                ErrorType.SERVER_ERROR,
            ),
        ];
    }

    async getErrorsByConsumerChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsByConsumerChartResponseDto> {
        const errors =
            await this.errorsRepository.getErrorsByConsumerChart(
                getErrorOptionsDto,
            );

        return {
            consumerIds: errors.map((e) => stringToInt(e.consumerId)),
            consumerNames: errors.map((e) => e.consumerName),
            requestCounts: errors.map((e) => stringToInt(e.requestCount)),
        };
    }

    private calculateRates(
        errors: IErrorRateChart[],
        totals: Map<string, number>,
    ): Omit<ErrorRatesChartResponseDto, 'errorType'> {
        const timeWindows: string[] = [];
        const errorRates: number[] = [];

        errors.forEach((e) => {
            const timeWindow = e.timeWindow.toISOString();
            const errorCount = stringToInt(e.errorCount);
            const totalCount = totals.get(timeWindow) ?? 1;
            const rate = (errorCount / totalCount) * 100;

            timeWindows.push(timeWindow);
            errorRates.push(Math.round(rate * 100) / 100);
        });

        return {
            timeWindows,
            errorRates,
        };
    }

    async getErrorRatesChart(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorRatesChartResponseDto[]> {
        const { totals, clientErrors, serverErrors } =
            await this.errorsRepository.getErrorRatesChart(getErrorOptionsDto);

        return [
            {
                ...this.calculateRates(clientErrors, totals),
                errorType: ErrorType.CLIENT_ERROR,
            },
            {
                ...this.calculateRates(serverErrors, totals),
                errorType: ErrorType.SERVER_ERROR,
            },
        ];
    }

    async getErrorsTable(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorsTableResponseDto[]> {
        const errors =
            await this.errorsRepository.getErrorsTable(getErrorOptionsDto);

        const expectedStatusCodesMap = new Map<string, number[]>();
        await Promise.all(
            errors.map(async (e) => {
                const expectedStatusCodes =
                    await this.endpointConfigsService.getExpectedStatusCodes(
                        getErrorOptionsDto.appId,
                        e.method,
                        e.path,
                    );

                expectedStatusCodesMap.set(
                    `${e.method}:${e.path}`,
                    expectedStatusCodes,
                );
            }),
        );

        const errorsTableItems: ErrorsTableResponseDto[] = [];
        errors.forEach((e) => {
            const expectedStatusCodes = expectedStatusCodesMap.get(
                `${e.method}:${e.path}`,
            );
            const statusCode = stringToInt(e.statusCode);
            const isExpected =
                expectedStatusCodes?.includes(statusCode) ?? false;

            errorsTableItems.push({
                id: e.id,
                method: e.method,
                path: e.path,
                statusCode,
                statusText: STATUS_CODES[statusCode] ?? 'Unknown',
                requestCount: stringToInt(e.requestCount),
                affectedConsumers: stringToInt(e.affectedConsumers),
                expected: isExpected,
            });
        });

        return errorsTableItems;
    }

    async getErrorDetails(
        getErrorOptionsDto: GetErrorOptionsDto,
    ): Promise<ErrorDetailsResponseDto> {
        const error =
            await this.errorsRepository.getErrorDetails(getErrorOptionsDto);

        return {
            requestCount: stringToInt(error?.requestCount),
            affectedConsumers: stringToInt(error?.affectedConsumers),
            lastTimestamp:
                error?.lastTimestamp?.toISOString() || new Date().toISOString(),
        };
    }
}
