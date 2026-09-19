import { Inject, Injectable } from '@nestjs/common';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { IPerformanceService } from './interfaces/performance-service.interface.js';
import type { IPerformanceRepository } from './interfaces/performance-repository.interface.js';
import type { GetPerformanceOptionsDto } from './dto/get-performance-options.dto.js';
import type { PerformanceMetricsResponseDto } from './dto/performance-metrics-response.dto.js';
import type { ApdexScoreChartResponseDto } from './dto/apdex-score-chart-response.dto.js';
import type { ResponseTimeChartResponseDto } from './dto/response-time-chart-response.dto.js';
import type { PerformanceEndpointsTableResponseDto } from './dto/performance-endpoints-table-response.dto.js';
import { stringToInt } from '@hitapi/shared/utils';
import { calculateRate } from '../../common/utils/rates.util.js';
import type { RestfulMethod } from '@hitapi/shared/enums';

@Injectable()
export class PerformanceService implements IPerformanceService {
    constructor(
        @Inject(Repositories.PERFORMANCE)
        private readonly performanceRepository: IPerformanceRepository,
    ) {}

    private calculateApdexScore(
        satisfied: number,
        tolerated: number,
        total: number,
    ): number {
        if (total === 0) return 0;
        return calculateRate(satisfied + tolerated / 2, total, 2);
    }

    async getPerformanceMetrics(
        options: GetPerformanceOptionsDto,
    ): Promise<PerformanceMetricsResponseDto> {
        const raw =
            await this.performanceRepository.getPerformanceMetrics(options);

        const totalRequestCount = stringToInt(raw?.totalRequestCount);
        const apdexSatisfiedCount = stringToInt(raw?.apdexSatisfiedCount);
        const apdexToleratedCount = stringToInt(raw?.apdexToleratedCount);
        const apdexFrustratedCount = stringToInt(raw?.apdexFrustratedCount);

        return {
            totalRequestCount,
            responseTimeP50: stringToInt(raw?.responseTimeP50),
            responseTimeP75: stringToInt(raw?.responseTimeP75),
            responseTimeP95: stringToInt(raw?.responseTimeP95),
            apdexSatisfiedCount,
            apdexToleratedCount,
            apdexFrustratedCount,
            apdexScore: this.calculateApdexScore(
                apdexSatisfiedCount,
                apdexToleratedCount,
                totalRequestCount,
            ),
            targetResponseTimeMs: stringToInt(raw?.targetResponseTimeMs),
        };
    }

    async getApdexScoreChart(
        options: GetPerformanceOptionsDto,
    ): Promise<ApdexScoreChartResponseDto> {
        const rows =
            await this.performanceRepository.getApdexScoreChart(options);

        const timeWindows: string[] = [];
        const apdexScores: Array<number | null> = [];
        const totalRequestCounts: number[] = [];

        for (const row of rows) {
            timeWindows.push(row.timeWindow.toISOString());
            const total = stringToInt(row.totalRequestCount);
            const satisfied = stringToInt(row.apdexSatisfiedCount);
            const tolerated = stringToInt(row.apdexToleratedCount);

            apdexScores.push(
                total > 0
                    ? this.calculateApdexScore(satisfied, tolerated, total)
                    : null,
            );
            totalRequestCounts.push(total);
        }

        return { timeWindows, apdexScores, totalRequestCounts };
    }

    async getResponseTimeChart(
        options: GetPerformanceOptionsDto,
    ): Promise<ResponseTimeChartResponseDto> {
        const rows =
            await this.performanceRepository.getResponseTimeChart(options);

        return {
            timeWindows: rows.map((r) => r.timeWindow.toISOString()),
            responseTimeP50: rows.map((r) =>
                r.responseTimeP50 !== null
                    ? stringToInt(r.responseTimeP50)
                    : null,
            ),
            responseTimeP75: rows.map((r) =>
                r.responseTimeP75 !== null
                    ? stringToInt(r.responseTimeP75)
                    : null,
            ),
            responseTimeP95: rows.map((r) =>
                r.responseTimeP95 !== null
                    ? stringToInt(r.responseTimeP95)
                    : null,
            ),
        };
    }

    async getPerformanceEndpointsTable(
        options: GetPerformanceOptionsDto,
    ): Promise<PerformanceEndpointsTableResponseDto[]> {
        const rows =
            await this.performanceRepository.getPerformanceEndpointsTable(
                options,
            );

        return rows.map((row) => {
            const totalRequestCount = stringToInt(row.totalRequestCount);
            const apdexSatisfiedCount = stringToInt(row.apdexSatisfiedCount);
            const apdexToleratedCount = stringToInt(row.apdexToleratedCount);
            const apdexFrustratedCount = stringToInt(row.apdexFrustratedCount);

            return {
                id: row.id,
                method: row.method as RestfulMethod,
                path: row.path,
                totalRequestCount,
                responseTimeP50: stringToInt(row.responseTimeP50),
                responseTimeP75: stringToInt(row.responseTimeP75),
                responseTimeP95: stringToInt(row.responseTimeP95),
                apdexSatisfiedCount,
                apdexToleratedCount,
                apdexFrustratedCount,
                apdexScore: this.calculateApdexScore(
                    apdexSatisfiedCount,
                    apdexToleratedCount,
                    totalRequestCount,
                ),
                targetResponseTimeMs: stringToInt(row.targetResponseTimeMs),
                excluded: row.excluded === 'true',
                removed: row.removed === 'true',
            };
        });
    }
}
