import { Inject, Injectable } from '@nestjs/common';
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm';
import { stringToInt } from '@hitapi/shared/utils';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { RequestLogsRepository } from '../../request-logs/repositories/request-logs.repository.js';
import type {
    ITrafficRepository,
    IRequestsChart,
    IRequestsPerMinuteChart,
    IDataTransferredChart,
    IRequestsByConsumerChart,
    ITrafficEndpointsTable,
    IStatusCodeCounts,
    ITrafficData,
} from '../interfaces/traffic-repository.interface.js';
import { RequestLog } from '../../request-logs/entities/request-log.entity.js';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';
import {
    parsePeriod,
    applyPeriodFilter,
} from '../../../common/utils/period.util.js';
import type { GetRequestsByConsumerChartOptionsDto } from '../dto/get-requests-by-consumer-chart-options.dto.js';
import type { ExportTrafficCsvOptionsDto } from '../dto/export-traffic-csv-options.dto.js';

@Injectable()
export class TrafficRepository implements ITrafficRepository {
    constructor(
        @Inject(Repositories.REQUEST_LOGS)
        private readonly requestLogsRepository: RequestLogsRepository,
    ) {}

    private applyPathFilter<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        { path, pathExact }: GetTrafficOptionsDto,
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
        criteria: GetTrafficOptionsDto,
    ): void {
        qb.where({ app: { id: criteria.appId } });

        if (criteria.consumerId) {
            qb.andWhere('rl.consumerId = :consumerId', {
                consumerId: criteria.consumerId,
            });
        }
        if (criteria.consumerGroupId) {
            qb.andWhere(
                'rl.consumerId IN (SELECT id FROM consumers WHERE groupId = :groupId)',
                {
                    groupId: criteria.consumerGroupId,
                },
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
                    start: start,
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

    async getRequestsChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IRequestsChart[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        const period = parsePeriod(criteria.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select(
                `DATE_TRUNC('${period.granularity}', rl.timestamp)`,
                'timeWindow',
            )
            .addSelect(
                `
                    CASE 
                        WHEN rl.statusCode < 400 THEN 'Successful'
                        WHEN rl.statusCode < 500 THEN 'Client error'
                        ELSE 'Server error'
                    END
                `,
                'responseStatus',
            )
            .addSelect('rl.statusCode', 'statusCode')
            .addSelect('COUNT(*)', 'count')
            .groupBy('"timeWindow"')
            .addGroupBy('"responseStatus"')
            .addGroupBy('"statusCode"')
            .orderBy('"timeWindow"', 'ASC')
            .addOrderBy('"responseStatus"')
            .getRawMany<IRequestsChart>();
    }

    async getRequestsPerMinuteChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IRequestsPerMinuteChart[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        const period = parsePeriod(criteria.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select(
                `DATE_TRUNC('${period.granularity}', rl.timestamp)`,
                'timeWindow',
            )
            .addSelect('COUNT(*)', 'count')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IRequestsPerMinuteChart>();
    }

    async getDataTransferredChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IDataTransferredChart[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        const period = parsePeriod(criteria.period);
        applyPeriodFilter<RequestLog>(qb, period, 'rl', 'timestamp');

        return qb
            .select(
                `DATE_TRUNC('${period.granularity}', rl.timestamp)`,
                'timeWindow',
            )
            .addSelect('SUM(COALESCE(rl.requestSize, 0))', 'requestSizeSum')
            .addSelect('SUM(COALESCE(rl.responseSize, 0))', 'responseSizeSum')
            .groupBy('"timeWindow"')
            .orderBy('"timeWindow"', 'ASC')
            .getRawMany<IDataTransferredChart>();
    }

    async getRequestsByConsumerChart(
        criteria: GetRequestsByConsumerChartOptionsDto,
    ): Promise<IRequestsByConsumerChart[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb
            .select('c.id', 'consumerId')
            .addSelect('COALESCE(c.name, c.identifier)', 'consumerName')
            .addSelect(
                `
                    CASE 
                        WHEN rl.statusCode < 400 THEN 'Successful'
                        WHEN rl.statusCode < 500 THEN 'Client error'
                        ELSE 'Server error'
                    END
                `,
                'responseStatus',
            )
            .addSelect('rl.statusCode', 'statusCode')
            .addSelect('COUNT(*)', 'count')
            .innerJoin('rl.consumer', 'c')
            .groupBy('c.id')
            .addGroupBy('"consumerName"')
            .addGroupBy('"responseStatus"')
            .addGroupBy('"statusCode"')
            .orderBy('COUNT(*)', 'DESC')
            .limit(criteria.limit)
            .getRawMany<IRequestsByConsumerChart>();
    }

    async getSizeHistogram(
        criteria: GetTrafficOptionsDto,
        field: 'requestSize' | 'responseSize',
    ): Promise<{ size: string }[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb
            .select(`rl.${field}`, 'size')
            .andWhere(`rl.${field} IS NOT NULL`)
            .orderBy('size', 'ASC')
            .getRawMany<{ size: string }>();
    }

    async getTrafficEndpointsTable(
        criteria: GetTrafficOptionsDto,
    ): Promise<ITrafficEndpointsTable[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb
            .select('e.id', 'id')
            .addSelect('rl.method', 'method')
            .addSelect('rl.path', 'path')
            .addSelect('COUNT(*)', 'totalRequestCount')
            .addSelect(
                'SUM(CASE WHEN rl.statusCode >= 400 AND rl.statusCode < 500 THEN 1 ELSE 0 END)',
                'clientErrorCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.statusCode >= 500 THEN 1 ELSE 0 END)',
                'serverErrorCount',
            )
            .addSelect(
                'SUM(COALESCE(rl.requestSize, 0) + COALESCE(rl.responseSize, 0))',
                'dataTransferred',
            )
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
            .orderBy('"totalRequestCount"', 'DESC')
            .getRawMany<ITrafficEndpointsTable>();
    }

    async getStatusCodeCounts(
        criteria: GetTrafficOptionsDto,
    ): Promise<IStatusCodeCounts[]> {
        const qb = this.requestLogsRepository.createQueryBuilder('rl');

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb
            .select('rl.method', 'method')
            .addSelect('rl.path', 'path')
            .addSelect('rl.statusCode', 'statusCode')
            .addSelect('COUNT(*)', 'requestCount')
            .groupBy('method')
            .addGroupBy('path')
            .addGroupBy('"statusCode"')
            .orderBy('"requestCount"', 'DESC')
            .getRawMany<IStatusCodeCounts>();
    }

    async getTrafficData(
        criteria: ExportTrafficCsvOptionsDto,
    ): Promise<ITrafficData[]> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select('COUNT(*)', 'requests')
            .addSelect('SUM(COALESCE(rl.requestSize, 0))', 'bytesReceived')
            .addSelect('SUM(COALESCE(rl.responseSize, 0))', 'bytesSent');

        if (criteria.groupBy?.includes('endpoint')) {
            qb.addSelect('rl.method', 'method')
                .addSelect('rl.path', 'path')
                .groupBy('method')
                .addGroupBy('path');
        }

        if (criteria.groupBy?.includes('consumer')) {
            qb.addSelect('c.identifier', 'consumer');
            qb.innerJoin('rl.consumer', 'c');
            qb.addGroupBy('consumer');
        }

        if (criteria.groupBy?.includes('statusCode')) {
            qb.addSelect('rl.statusCode', 'statusCode');
            qb.addGroupBy('"statusCode"');
        }

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawMany<ITrafficData>();
    }
}
