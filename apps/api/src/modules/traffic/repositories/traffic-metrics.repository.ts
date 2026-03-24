import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    type ObjectLiteral,
    type SelectQueryBuilder,
    type QueryRunner,
} from 'typeorm';
import { stringToInt } from '@hitapi/shared/utils';
import type {
    ITrafficMetrics,
    ITrafficMetricsRepository,
} from '../interfaces/traffic-metrics-repository.interface.js';
import { TrafficMetric } from '../entities/traffic-metric.entity.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { RequestLogsRepository } from '../../request-logs/repositories/request-logs.repository.js';
import { RequestLog } from '../../request-logs/entities/request-log.entity.js';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';
import {
    applyPeriodFilter,
    parsePeriod,
} from '../../../common/utils/period.util.js';
import type { MaybeType } from '../../../common/types/maybe.type.js';
import type { CreateTrafficMetricsDto } from '../dto/create-traffic-metrics.dto.js';

@Injectable()
export class TrafficMetricsRepository implements ITrafficMetricsRepository {
    constructor(
        @InjectRepository(TrafficMetric)
        private readonly trafficMetricsRepository: Repository<TrafficMetric>,
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

    async getTotalRequests(
        criteria: Pick<GetTrafficOptionsDto, 'appId' | 'period'>,
    ): Promise<number> {
        const qb = this.trafficMetricsRepository
            .createQueryBuilder('tm')
            .select('SUM(tm.requestCount)', 'totalRequestCount')
            .where('a.id = :appId', { appId: criteria.appId })
            .innerJoin('tm.endpoint', 'e')
            .innerJoin('e.app', 'a');

        applyPeriodFilter<TrafficMetric>(
            qb,
            parsePeriod(criteria.period),
            'tm',
            'timeWindow',
        );

        return qb
            .getRawOne<{ totalRequestCount: string }>()
            .then((res) => stringToInt(res?.totalRequestCount));
    }

    async getTrafficMetrics(
        criteria: Pick<GetTrafficOptionsDto, 'appId' | 'period'>,
    ): Promise<
        MaybeType<
            Omit<ITrafficMetrics, 'clientErrorCount' | 'serverErrorCount'>
        >
    > {
        const qb = this.trafficMetricsRepository
            .createQueryBuilder('tm')
            .select('SUM(tm.requestCount)', 'totalRequestCount')
            .addSelect('SUM(tm.requestSizeSum)', 'requestSizeSum')
            .addSelect('AVG(tm.requestSizeSum)', 'requestSizeAvg')
            .addSelect('SUM(tm.responseSizeSum)', 'responseSizeSum')
            .addSelect('AVG(tm.responseSizeSum)', 'responseSizeAvg')
            .addSelect(
                'SUM(tm.requestSizeSum + tm.responseSizeSum)',
                'totalDataTransferred',
            )
            .addSelect('COUNT(DISTINCT tm.consumer)', 'uniqueConsumerCount')
            .where('a.id = :appId', { appId: criteria.appId })
            .innerJoin('tm.endpoint', 'e')
            .innerJoin('e.app', 'a');

        applyPeriodFilter<TrafficMetric>(
            qb,
            parsePeriod(criteria.period),
            'tm',
            'timeWindow',
        );

        return qb.getRawOne<
            Omit<ITrafficMetrics, 'clientErrorCount' | 'serverErrorCount'>
        >();
    }

    async getTrafficMetricsFiltered(
        criteria: GetTrafficOptionsDto,
    ): Promise<MaybeType<ITrafficMetrics>> {
        const qb = this.requestLogsRepository
            .createQueryBuilder('rl')
            .select('COUNT(*)', 'totalRequestCount')
            .addSelect(
                'SUM(CASE WHEN rl.statusCode >= 400 AND rl.statusCode < 500 THEN 1 ELSE 0 END)',
                'clientErrorCount',
            )
            .addSelect(
                'SUM(CASE WHEN rl.statusCode >= 500 THEN 1 ELSE 0 END)',
                'serverErrorCount',
            )
            .addSelect('SUM(COALESCE(rl.requestSize, 0))', 'requestSizeSum')
            .addSelect('AVG(rl.requestSize)', 'requestSizeAvg')
            .addSelect('SUM(COALESCE(rl.responseSize, 0))', 'responseSizeSum')
            .addSelect('AVG(rl.responseSize)', 'responseSizeAvg')
            .addSelect('COUNT(DISTINCT rl.consumerId)', 'uniqueConsumerCount')
            .where({ app: { id: criteria.appId } });

        this.applyFilters<RequestLog>(qb, criteria);
        applyPeriodFilter<RequestLog>(
            qb,
            parsePeriod(criteria.period),
            'rl',
            'timestamp',
        );

        return qb.getRawOne<ITrafficMetrics>();
    }

    async upsertTrafficMetrics(
        createTrafficMetricsDto: CreateTrafficMetricsDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(TrafficMetric)
            : this.trafficMetricsRepository;

        await repository.upsert(
            {
                ...createTrafficMetricsDto,
                endpoint: { id: createTrafficMetricsDto.endpointId },
                consumer: { id: createTrafficMetricsDto.consumerId },
            },
            {
                conflictPaths: ['endpoint', 'consumer', 'timeWindow'],
                skipUpdateIfNoValuesChanged: true,
            },
        );
    }
}
