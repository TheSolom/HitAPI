import type { QueryRunner } from 'typeorm';
import type { MaybeType } from '../../../common/types/maybe.type.js';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';
import type { CreateTrafficMetricsDto } from '../dto/create-traffic-metrics.dto.js';

export interface ITrafficMetrics {
    totalRequestCount: string;
    clientErrorCount: string;
    serverErrorCount: string;
    requestSizeSum: string;
    requestSizeAvg: string;
    responseSizeSum: string;
    responseSizeAvg: string;
    totalDataTransferred: string;
    uniqueConsumerCount: string;
}

export interface ITrafficMetricsRepository {
    /**
     * Get total request count for an app within a period.
     * @param criteria
     * @returns {Promise<number>}
     */
    getTotalRequests(
        criteria: Pick<GetTrafficOptionsDto, 'appId' | 'period'>,
    ): Promise<number>;
    /**
     * Get traffic metrics for an app within a period.
     * @param criteria
     * @returns {Promise<MaybeType<ITrafficMetrics>>}
     */
    getTrafficMetrics(
        criteria: Pick<GetTrafficOptionsDto, 'appId' | 'period'>,
    ): Promise<
        MaybeType<
            Omit<ITrafficMetrics, 'clientErrorCount' | 'serverErrorCount'>
        >
    >;
    /**
     * Get traffic metrics for an app within a period with filters.
     * @param criteria
     * @returns {Promise<MaybeType<ITrafficMetrics>>}
     */
    getTrafficMetricsFiltered(
        criteria: GetTrafficOptionsDto,
    ): Promise<MaybeType<ITrafficMetrics>>;
    /**
     * Upsert traffic metrics.
     * @param createTrafficMetricsDto
     * @param queryRunner
     * @returns {Promise<void>}
     */
    upsertTrafficMetrics(
        createTrafficMetricsDto: CreateTrafficMetricsDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
}
