import { Inject, Injectable } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';
import { STATUS_CODES } from 'node:http';
import { stringToInt, stringToFloat } from '@hitapi/shared/utils';
import type { RestfulMethod } from '@hitapi/shared/enums';
import type { ITrafficService } from './interfaces/traffic-service.interface.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { ITrafficMetricsRepository } from './interfaces/traffic-metrics-repository.interface.js';
import type { IErrorsRepository } from '../errors/interfaces/errors-repository.interface.js';
import type { ITrafficRepository } from './interfaces/traffic-repository.interface.js';
import type { GetTrafficOptionsDto } from './dto/get-traffic-options.dto.js';
import type { TrafficMetricsResponseDto } from './dto/traffic-metrics-response.dto.js';
import { parsePeriod } from '../../common/utils/period.util.js';
import type { ParsedPeriod } from '../../common/types/period.type.js';
import type { CreateTrafficMetricsDto } from './dto/create-traffic-metrics.dto.js';
import type { RequestsChartResponseDto } from './dto/requests-chart-response.dto.js';
import type { ResponseStatus } from './enums/response-status.enum.js';
import type { RequestsPerMinuteChartResponseDto } from './dto/requests-per-minute-chart-response.dto.js';
import type { DataTransferredChartResponseDto } from './dto/data-transferred-chart-response.dto.js';
import type { RequestsByConsumerChartResponseDto } from './dto/requests-by-consumer-chart-response.dto.js';
import type { GetRequestsByConsumerChartOptionsDto } from './dto/get-requests-by-consumer-chart-options.dto.js';
import type { SizeHistogramResponseDto } from './dto/size-histogram-response.dto.js';
import type { TrafficEndpointsTableResponseDto } from './dto/traffic-endpoints-table-response.dto.js';
import { calculateRate } from '../../common/utils/rates.util.js';
import type { StatusCodeCountsResponseDto } from './dto/status-code-counts-response.dto.js';
import type { ExportTrafficCsvOptionsDto } from './dto/export-traffic-csv-options.dto.js';
import { createCSV } from '../../common/utils/csv.util.js';

@Injectable()
export class TrafficService implements ITrafficService {
    constructor(
        @Inject(Repositories.TRAFFIC_METRICS)
        private readonly trafficMetricsRepository: ITrafficMetricsRepository,
        @Inject(Repositories.ERRORS)
        private readonly errorsRepository: IErrorsRepository,
        @Inject(Repositories.TRAFFIC)
        private readonly trafficRepository: ITrafficRepository,
    ) {}

    private hasTrafficFilters(
        getTrafficOptionsDto: GetTrafficOptionsDto,
    ): boolean {
        return Boolean(
            getTrafficOptionsDto.consumerId ||
            getTrafficOptionsDto.consumerGroupId ||
            getTrafficOptionsDto.method ||
            getTrafficOptionsDto.path ||
            getTrafficOptionsDto.pathExact ||
            getTrafficOptionsDto.statusCode,
        );
    }

    private async fetchFilteredMetrics(
        getTrafficOptionsDto: GetTrafficOptionsDto,
    ) {
        return Promise.all([
            this.trafficMetricsRepository.getTrafficMetricsFiltered(
                getTrafficOptionsDto,
            ),
            this.errorsRepository.getErrorMetricsFiltered(getTrafficOptionsDto),
        ]).then(([trafficMetrics, errorsMetrics]) => ({
            trafficMetrics,
            errorsMetrics,
        }));
    }

    private async fetchUnfilteredMetrics(
        getTrafficOptionsDto: GetTrafficOptionsDto,
    ) {
        return Promise.all([
            this.trafficMetricsRepository.getTrafficMetrics(
                getTrafficOptionsDto,
            ),
            this.errorsRepository.getErrorMetrics(getTrafficOptionsDto),
        ]).then(([trafficMetrics, errorsMetrics]) => ({
            trafficMetrics,
            errorsMetrics,
        }));
    }

    async getTrafficMetrics(
        getTrafficOptionsDto: GetTrafficOptionsDto,
    ): Promise<TrafficMetricsResponseDto> {
        const { trafficMetrics, errorsMetrics } = this.hasTrafficFilters(
            getTrafficOptionsDto,
        )
            ? await this.fetchFilteredMetrics(getTrafficOptionsDto)
            : await this.fetchUnfilteredMetrics(getTrafficOptionsDto);

        const totalRequestCount = stringToInt(
            trafficMetrics?.totalRequestCount,
        );
        const clientErrorCount = stringToInt(errorsMetrics?.clientErrorCount);
        const serverErrorCount = stringToInt(errorsMetrics?.serverErrorCount);
        const errorRate = calculateRate(
            clientErrorCount + serverErrorCount,
            totalRequestCount,
            2,
        );

        let requestsPerMinute = 0;
        const period: ParsedPeriod = parsePeriod(getTrafficOptionsDto.period);
        if (period.type === 'range') {
            const periodMinutes =
                (period.endDate.getTime() - period.startDate.getTime()) / 60000;
            requestsPerMinute =
                periodMinutes > 0 ? totalRequestCount / periodMinutes : 0;
        } else {
            const periodMinutes = period.durationMs / 60000;
            requestsPerMinute =
                periodMinutes > 0 ? totalRequestCount / periodMinutes : 0;
        }

        return {
            totalRequestCount,
            requestsPerMinute: Math.round(requestsPerMinute * 100) / 100,
            clientErrorCount,
            serverErrorCount,
            errorRate,
            requestSizeSum: stringToInt(trafficMetrics?.requestSizeSum),
            requestSizeAvg: trafficMetrics?.requestSizeAvg
                ? Math.round(stringToFloat(trafficMetrics?.requestSizeAvg))
                : undefined,
            responseSizeSum: stringToInt(trafficMetrics?.responseSizeSum),
            responseSizeAvg: trafficMetrics?.responseSizeAvg
                ? Math.round(stringToFloat(trafficMetrics?.responseSizeAvg))
                : undefined,
            totalDataTransferred: stringToInt(
                trafficMetrics?.totalDataTransferred,
            ),
            uniqueConsumerCount: stringToInt(
                trafficMetrics?.uniqueConsumerCount,
            ),
        };
    }

    async upsertTrafficMetrics(
        createTrafficMetricsDto: CreateTrafficMetricsDto,
        queryRunner?: QueryRunner,
    ) {
        await this.trafficMetricsRepository.upsertTrafficMetrics(
            createTrafficMetricsDto,
            queryRunner,
        );
    }

    async getRequestsChart(
        getRequestsChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<RequestsChartResponseDto[]> {
        const requestsChart = await this.trafficRepository.getRequestsChart(
            getRequestsChartOptionsDto,
        );

        const datasets = new Map<string, RequestsChartResponseDto>();

        for (const row of requestsChart) {
            const status = row.responseStatus as ResponseStatus;

            if (!datasets.has(status)) {
                datasets.set(status, {
                    responseStatus: status,
                    timeWindows: [],
                    requestCounts: [],
                    statusCodeCounts: [],
                });
            }

            const dataset = datasets.get(status)!;
            const timeWindow = row.timeWindow.toISOString();

            const existingIndex = dataset.timeWindows.indexOf(timeWindow);
            if (existingIndex === -1) {
                dataset.timeWindows.push(timeWindow);
                dataset.requestCounts.push(Number.parseInt(row.count));
                dataset.statusCodeCounts.push([
                    [
                        Number.parseInt(row.statusCode),
                        Number.parseInt(row.count),
                    ],
                ]);
            } else {
                dataset.requestCounts[existingIndex] += Number.parseInt(
                    row.count,
                );
                dataset.statusCodeCounts[existingIndex].push([
                    Number.parseInt(row.statusCode),
                    Number.parseInt(row.count),
                ]);
            }
        }

        return Array.from(datasets.values());
    }

    private getIntervalMinutes(interval: string): number | null {
        const intervalMap: Record<string, number> = {
            minute: 1,
            hour: 60,
            day: 1440,
        };
        return intervalMap[interval] ?? null;
    }

    async getRequestsPerMinuteChart(
        getRequestsPerMinuteChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<RequestsPerMinuteChartResponseDto> {
        const requestsPerMinuteChart =
            await this.trafficRepository.getRequestsPerMinuteChart(
                getRequestsPerMinuteChartOptionsDto,
            );

        const HOUR_IN_MINUTES = 60;
        const intervalMinutes =
            this.getIntervalMinutes(
                parsePeriod(getRequestsPerMinuteChartOptionsDto.period)
                    .granularity,
            ) ?? HOUR_IN_MINUTES;

        return {
            timeWindows: requestsPerMinuteChart.map((row) =>
                row.timeWindow.toISOString(),
            ),
            requestsPerMinute: requestsPerMinuteChart.map(
                (row) =>
                    Math.round(
                        (Number.parseInt(row.count) / intervalMinutes) * 100,
                    ) / 100,
            ),
        };
    }

    async getDataTransferredChart(
        getDataTransferredChartOptionsDto: GetTrafficOptionsDto,
    ): Promise<DataTransferredChartResponseDto> {
        const dataTransferredChart =
            await this.trafficRepository.getDataTransferredChart(
                getDataTransferredChartOptionsDto,
            );

        return {
            timeWindows: dataTransferredChart.map((row) =>
                row.timeWindow.toISOString(),
            ),
            requestSizeSums: dataTransferredChart.map((row) =>
                Number.parseInt(row.requestSizeSum),
            ),
            responseSizeSums: dataTransferredChart.map((row) =>
                Number.parseInt(row.responseSizeSum),
            ),
        };
    }

    async getRequestsByConsumerChart(
        getRequestsByConsumerChartOptionsDto: GetRequestsByConsumerChartOptionsDto,
    ): Promise<RequestsByConsumerChartResponseDto[]> {
        const requestsByConsumerChart =
            await this.trafficRepository.getRequestsByConsumerChart(
                getRequestsByConsumerChartOptionsDto,
            );

        const datasets = new Map<string, RequestsByConsumerChartResponseDto>();

        for (const row of requestsByConsumerChart) {
            const status = row.responseStatus as ResponseStatus;
            if (!datasets.has(status)) {
                datasets.set(status, {
                    responseStatus: status,
                    consumerIds: [],
                    consumerNames: [],
                    requestCounts: [],
                    statusCodeCounts: [],
                });
            }

            const dataset = datasets.get(status)!;
            const existingIndex = dataset.consumerIds.indexOf(
                Number.parseInt(row.consumerId),
            );

            if (existingIndex === -1) {
                dataset.consumerIds.push(Number.parseInt(row.consumerId));
                dataset.consumerNames.push(row.consumerName);
                dataset.requestCounts.push(Number.parseInt(row.count));
                dataset.statusCodeCounts.push([
                    [
                        Number.parseInt(row.statusCode),
                        Number.parseInt(row.count),
                    ],
                ]);
            } else {
                dataset.requestCounts[existingIndex] += Number.parseInt(
                    row.count,
                );
                dataset.statusCodeCounts[existingIndex].push([
                    Number.parseInt(row.statusCode),
                    Number.parseInt(row.count),
                ]);
            }
        }

        return Array.from(datasets.values());
    }

    private calculateHistogram(
        sizeHistogram: { size: string }[],
    ): SizeHistogramResponseDto {
        const sortedSizes: number[] = sizeHistogram.map((item) =>
            Number.parseInt(item.size),
        );

        if (sortedSizes.length === 0) {
            return { bins: [], counts: [], binSize: 0 };
        }

        const gcd = (a: number, b: number): number =>
            b === 0 ? a : gcd(b, a % b);

        let binSize = 0;
        for (let i = 1; i < sortedSizes.length; i++) {
            const diff = sortedSizes[i] - sortedSizes[i - 1];
            if (diff > 0) {
                binSize = gcd(binSize, diff);
            }
        }
        if (binSize === 0) binSize = 1;

        const uniqueSizes = Array.from(new Set(sortedSizes));

        const bins: number[] = [],
            counts: number[] = [];

        for (let i = 0; i < uniqueSizes.length; i++) {
            const binStart = uniqueSizes[i];
            const binEnd = uniqueSizes[i + 1] ?? binStart + binSize;

            bins.push(binStart);
            const count = sortedSizes.filter(
                (size) => size >= binStart && size < binEnd,
            ).length;
            counts.push(count);
        }

        return { bins, counts, binSize };
    }

    async getRequestSizeHistogram(
        getRequestSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ): Promise<SizeHistogramResponseDto> {
        const requestSizeHistogram =
            await this.trafficRepository.getSizeHistogram(
                getRequestSizeHistogramOptionsDto,
                'requestSize',
            );

        return this.calculateHistogram(requestSizeHistogram);
    }

    async getResponseSizeHistogram(
        getResponseSizeHistogramOptionsDto: GetTrafficOptionsDto,
    ): Promise<SizeHistogramResponseDto> {
        const responseSizeHistogram =
            await this.trafficRepository.getSizeHistogram(
                getResponseSizeHistogramOptionsDto,
                'responseSize',
            );

        return this.calculateHistogram(responseSizeHistogram);
    }

    async getTrafficEndpointsTable(
        getTrafficEndpointsTableOptionsDto: GetTrafficOptionsDto,
    ): Promise<TrafficEndpointsTableResponseDto[]> {
        const trafficEndpointsTable =
            await this.trafficRepository.getTrafficEndpointsTable(
                getTrafficEndpointsTableOptionsDto,
            );

        return trafficEndpointsTable.map((row) => ({
            id: row.id,
            method: row.method as RestfulMethod,
            path: row.path,
            totalRequestCount: Number.parseInt(row.totalRequestCount),
            clientErrorCount: Number.parseInt(row.clientErrorCount),
            serverErrorCount: Number.parseInt(row.serverErrorCount),
            errorRate: calculateRate(
                Number.parseInt(row.clientErrorCount) +
                    Number.parseInt(row.serverErrorCount),
                Number.parseInt(row.totalRequestCount),
            ),
            dataTransferred: Number.parseInt(row.dataTransferred),
            excluded: row.excluded === 'true',
            removed: row.removed === 'true',
        }));
    }

    async getStatusCodeCounts(
        getStatusCodeCountsOptionsDto: GetTrafficOptionsDto,
    ): Promise<StatusCodeCountsResponseDto[]> {
        const statusCodeCounts =
            await this.trafficRepository.getStatusCodeCounts(
                getStatusCodeCountsOptionsDto,
            );

        return statusCodeCounts.map((row) => ({
            method: row.method as RestfulMethod,
            path: row.path,
            statusCode: Number.parseInt(row.statusCode),
            description: STATUS_CODES[row.statusCode],
            requestCount: Number.parseInt(row.requestCount),
        }));
    }

    async exportTrafficCsv(
        exportTrafficCsvData: ExportTrafficCsvOptionsDto,
    ): Promise<string> {
        const data =
            await this.trafficRepository.getTrafficData(exportTrafficCsvData);

        const headers = [
            'periodStart',
            'periodEnd',
            'requests',
            'bytesReceived',
            'bytesSent',
        ];

        if (exportTrafficCsvData.groupBy?.includes('endpoint')) {
            headers.push('method', 'path');
        }
        if (exportTrafficCsvData.groupBy?.includes('consumer')) {
            headers.push('consumer');
        }
        if (exportTrafficCsvData.groupBy?.includes('statusCode')) {
            headers.push('statusCode');
        }

        const period = parsePeriod(exportTrafficCsvData.period);

        const periodStart =
            period.type === 'range' ? period.startDate : period.since;
        const periodEnd = period.type === 'range' ? period.endDate : new Date();

        return createCSV(
            data.map((item) => ({
                periodStart: periodStart.setSeconds(0, 0).toString(),
                periodEnd: periodEnd.setSeconds(0, 0).toString(),
                ...item,
            })),
            headers,
        );
    }
}
