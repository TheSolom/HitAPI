import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    type ObjectLiteral,
    type SelectQueryBuilder,
} from 'typeorm';
import { stringToInt } from '@hitapi/shared/utils';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { RequestLogsRepository } from '../../request-logs/repositories/request-logs.repository.js';
import { RequestLog } from '../../request-logs/entities/request-log.entity.js';
import { TrafficMetric } from '../../traffic/entities/traffic-metric.entity.js';
import {
    applyPeriodFilter,
    parsePeriod,
} from '../../../common/utils/period.util.js';
import type { GetPerformanceOptionsDto } from '../dto/get-performance-options.dto.js';
import type {
    IPerformanceRepository,
    IPerformanceMetricsRaw,
    IApdexScoreChartRaw,
    IResponseTimeChartRaw,
    IPerformanceEndpointsTableRaw,
} from '../interfaces/performance-repository.interface.js';

@Injectable()
export class PerformanceRepository implements IPerformanceRepository {
    constructor(
        @Inject(Repositories.REQUEST_LOGS)
        private readonly requestLogsRepository: RequestLogsRepository,
        @InjectRepository(TrafficMetric)
        private readonly trafficMetricRepository: Repository<TrafficMetric>,
    ) {}

    private applyRequestLogFilters<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        criteria: GetPerformanceOptionsDto,
    ): void {
        qb.where({ app: { id: criteria.appId } });

        if (criteria.consumerId) {
            qb.andWhere('rl.consumerId = :consumerId', {
                consumerId: criteria.consumerId,
            });
        }
        if (criteria.consumerGroupId) {
            qb.andWhere(
                'rl.consumerId IN (SELECT id FROM consumers WHERE "groupId" = :groupId)',
                { groupId: criteria.consumerGroupId },
            );
        }
        if (criteria.method) {
            qb.andWhere('rl.method = :method', { method: criteria.method });
        }
        if (criteria.statusCode) {
            const match = /^([1-5])xx$/.exec(criteria.statusCode);
            if (match) {
                const start = stringToInt(match[1]) * 100;
                qb.andWhere('rl.statusCode BETWEEN :start AND :end', {
                    start,
                    end: start + 99,
                });
            } else {
                qb.andWhere('rl.statusCode = :statusCode', {
                    statusCode: stringToInt(criteria.statusCode),
                });
            }
        }
        if (criteria.path) {
            if (criteria.pathExact) {
                qb.andWhere('rl.path = :path', { path: criteria.path });
            } else {
                qb.andWhere('rl.path LIKE :path', {
                    path: `%${criteria.path}%`,
                });
            }
        }
    }

    /**
     * Overall headline KPIs — kept on request_logs for exact PERCENTILE_CONT accuracy.
     */
    async getPerformanceMetrics(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceMetricsRaw | undefined> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyRequestLogFilters<RequestLog>(qb, options);
        const period = parsePeriod(options.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select('COUNT(*)', 'totalRequestCount')
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP50',
            )
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP75',
            )
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP95',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime <= a.targetResponseTimeMs THEN 1 ELSE 0 END)',
                'apdexSatisfiedCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime > a.targetResponseTimeMs AND rl.responseTime <= a.targetResponseTimeMs * 4 THEN 1 ELSE 0 END)',
                'apdexToleratedCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime > a.targetResponseTimeMs * 4 THEN 1 ELSE 0 END)',
                'apdexFrustratedCount',
            )
            .addSelect('MAX(a.targetResponseTimeMs)', 'targetResponseTimeMs')
            .innerJoin('rl.app', 'a')
            .getRawOne<IPerformanceMetricsRaw>();
    }

    /**
     * Apdex score over time — queries pre-aggregated traffic_metrics for O(rows) performance.
     */
    async getApdexScoreChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IApdexScoreChartRaw[]> {
        const period = parsePeriod(options.period);

        const qb = this.trafficMetricRepository
            .createQueryBuilder('tm')
            .select(
                `DATE_TRUNC('${period.granularity}', tm.timeWindow)`,
                'timeWindow',
            )
            .addSelect('SUM(tm.requestCount)', 'totalRequestCount')
            .addSelect('SUM(tm.apdexSatisfiedCount)', 'apdexSatisfiedCount')
            .addSelect('SUM(tm.apdexToleratedCount)', 'apdexToleratedCount')
            .innerJoin('tm.endpoint', 'e')
            .innerJoin('e.app', 'a')
            .where('a.id = :appId', { appId: options.appId });

        applyPeriodFilter<TrafficMetric>(qb, period, 'tm', 'timeWindow');

        return qb
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IApdexScoreChartRaw>();
    }

    /**
     * Response-time chart over time — uses weighted-average of pre-aggregated percentiles.
     * Acceptable approximation for a trend chart; saves a full request_logs scan.
     */
    async getResponseTimeChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IResponseTimeChartRaw[]> {
        const period = parsePeriod(options.period);

        const qb = this.trafficMetricRepository
            .createQueryBuilder('tm')
            .select(
                `DATE_TRUNC('${period.granularity}', tm.timeWindow)`,
                'timeWindow',
            )
            .addSelect(
                'SUM(tm.responseTimeP50 * tm.requestCount) / NULLIF(SUM(tm.requestCount), 0)',
                'responseTimeP50',
            )
            .addSelect(
                'SUM(tm.responseTimeP75 * tm.requestCount) / NULLIF(SUM(tm.requestCount), 0)',
                'responseTimeP75',
            )
            .addSelect(
                'SUM(tm.responseTimeP95 * tm.requestCount) / NULLIF(SUM(tm.requestCount), 0)',
                'responseTimeP95',
            )
            .innerJoin('tm.endpoint', 'e')
            .innerJoin('e.app', 'a')
            .where('a.id = :appId', { appId: options.appId });

        applyPeriodFilter<TrafficMetric>(qb, period, 'tm', 'timeWindow');

        return qb
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IResponseTimeChartRaw>();
    }

    /**
     * Per-endpoint breakdown — kept on request_logs for exact PERCENTILE_CONT per endpoint.
     */
    async getPerformanceEndpointsTable(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceEndpointsTableRaw[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyRequestLogFilters<RequestLog>(qb, options);
        const period = parsePeriod(options.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select('e.id', 'id')
            .addSelect('rl.method', 'method')
            .addSelect('rl.path', 'path')
            .addSelect('COUNT(*)', 'totalRequestCount')
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP50',
            )
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP75',
            )
            .addSelect(
                'COALESCE(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY rl.responseTime), 0)',
                'responseTimeP95',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime <= a.targetResponseTimeMs THEN 1 ELSE 0 END)',
                'apdexSatisfiedCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime > a.targetResponseTimeMs AND rl.responseTime <= a.targetResponseTimeMs * 4 THEN 1 ELSE 0 END)',
                'apdexToleratedCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime > a.targetResponseTimeMs * 4 THEN 1 ELSE 0 END)',
                'apdexFrustratedCount',
            )
            .addSelect('a.targetResponseTimeMs', 'targetResponseTimeMs')
            .addSelect('e.excluded', 'excluded')
            .addSelect('e.deletedAt IS NOT NULL', 'removed')
            .innerJoin('rl.app', 'a')
            .leftJoin(
                'a.endpoints',
                'e',
                'e.method = rl.method AND e.path = rl.path',
            )
            .groupBy('e.id')
            .addGroupBy('rl.method')
            .addGroupBy('rl.path')
            .addGroupBy('excluded')
            .addGroupBy('removed')
            .addGroupBy('a.targetResponseTimeMs')
            .orderBy('"totalRequestCount"', 'DESC')
            .getRawMany<IPerformanceEndpointsTableRaw>();
    }
}
