import { Inject, Injectable } from '@nestjs/common';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';
import { stringToInt } from '@hitapi/shared/utils';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { RequestLogsRepository } from '../../request-logs/repositories/request-logs.repository.js';
import { RequestLog } from '../../request-logs/entities/request-log.entity.js';
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
    ) {}

    private applyPathFilter<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        { path, pathExact }: GetPerformanceOptionsDto,
    ): void {
        if (!path) return;
        if (pathExact) {
            qb.andWhere('rl.path = :path', { path });
        } else {
            qb.andWhere('rl.path LIKE :path', { path: `%${path}%` });
        }
    }

    private applyFilters<T extends ObjectLiteral>(
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

        this.applyPathFilter(qb, criteria);
    }

    async getPerformanceMetrics(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceMetricsRaw | undefined> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, options);
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

    async getApdexScoreChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IApdexScoreChartRaw[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, options);
        const period = parsePeriod(options.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select(
                `DATE_TRUNC('${period.granularity}', rl.timestamp)`,
                'timeWindow',
            )
            .addSelect('COUNT(*)', 'totalRequestCount')
            .addSelect(
                'SUM(CASE WHEN rl.responseTime <= a.targetResponseTimeMs THEN 1 ELSE 0 END)',
                'apdexSatisfiedCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.responseTime > a.targetResponseTimeMs AND rl.responseTime <= a.targetResponseTimeMs * 4 THEN 1 ELSE 0 END)',
                'apdexToleratedCount',
            )
            .innerJoin('rl.app', 'a')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IApdexScoreChartRaw>();
    }

    async getResponseTimeChart(
        options: GetPerformanceOptionsDto,
    ): Promise<IResponseTimeChartRaw[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, options);
        const period = parsePeriod(options.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select(
                `DATE_TRUNC('${period.granularity}', rl.timestamp)`,
                'timeWindow',
            )
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
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IResponseTimeChartRaw>();
    }

    async getPerformanceEndpointsTable(
        options: GetPerformanceOptionsDto,
    ): Promise<IPerformanceEndpointsTableRaw[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, options);
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
