import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { stringToInt } from '@hitapi/shared/utils';
import type { ITrafficMetricsRepository } from '../interfaces/traffic-metrics-repository.interface.js';
import { TrafficMetric } from '../entities/traffic-metric.entity.js';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';
import {
    applyPeriodFilter,
    parsePeriod,
} from '../../../common/utils/period.util.js';

@Injectable()
export class TrafficMetricsRepository implements ITrafficMetricsRepository {
    constructor(
        @InjectRepository(TrafficMetric)
        private readonly trafficMetricsRepository: Repository<TrafficMetric>,
    ) {}

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
}
