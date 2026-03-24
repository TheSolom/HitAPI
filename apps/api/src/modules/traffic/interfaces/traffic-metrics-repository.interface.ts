import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';

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
}
