import type { ExportTrafficCsvOptionsDto } from '../dto/export-traffic-csv-options.dto.js';
import type { GetTrafficOptionsDto } from '../dto/get-traffic-options.dto.js';

export interface IRequestsChart {
    timeWindow: Date;
    responseStatus: string;
    statusCode: string;
    count: string;
}

export interface IRequestsPerMinuteChart {
    timeWindow: Date;
    count: string;
}

export interface IDataTransferredChart {
    timeWindow: Date;
    requestSizeSum: string;
    responseSizeSum: string;
}

export interface IRequestsByConsumerChart {
    consumerId: string;
    consumerName: string;
    responseStatus: string;
    statusCode: string;
    count: string;
}

export interface ITrafficEndpointsTable {
    id: string;
    method: string;
    path: string;
    totalRequestCount: string;
    clientErrorCount: string;
    serverErrorCount: string;
    errorRate: string;
    dataTransferred: string;
    excluded: string;
    removed: string;
}

export interface IStatusCodeCounts {
    method: string;
    path: string;
    statusCode: string;
    requestCount: string;
}

export interface ITrafficData {
    method?: string;
    path?: string;
    consumer?: string;
    statusCode?: string;
    requests: string;
    bytesReceived: string;
    bytesSent: string;
}

export interface ITrafficRepository {
    /**
     * Get requests chart for an app within a period.
     * @param criteria
     * @returns {Promise<IRequestsChart[]>}
     */
    getRequestsChart(criteria: GetTrafficOptionsDto): Promise<IRequestsChart[]>;
    /**
     * Get requests per minute chart for an app within a period.
     * @param criteria
     * @returns {Promise<IRequestsPerMinuteChart[]>}
     */
    getRequestsPerMinuteChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IRequestsPerMinuteChart[]>;
    /**
     * Get data transferred chart for an app within a period.
     * @param criteria
     * @returns {Promise<IDataTransferredChart[]>}
     */
    getDataTransferredChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IDataTransferredChart[]>;
    /**
     * Get requests by consumer chart for an app within a period.
     * @param criteria
     * @returns {Promise<IRequestsByConsumerChart[]>}
     */
    getRequestsByConsumerChart(
        criteria: GetTrafficOptionsDto,
    ): Promise<IRequestsByConsumerChart[]>;
    /**
     * Get size histogram for an app within a period.
     * @param criteria
     * @param field
     * @returns {Promise<{ size: string }[]>}
     */
    getSizeHistogram(
        criteria: GetTrafficOptionsDto,
        field: 'requestSize' | 'responseSize',
    ): Promise<{ size: string }[]>;
    /**
     * Get traffic endpoints table for an app within a period.
     * @param criteria
     * @returns {Promise<ITrafficEndpointsTable[]>}
     */
    getTrafficEndpointsTable(
        criteria: GetTrafficOptionsDto,
    ): Promise<ITrafficEndpointsTable[]>;
    /**
     * Get status code counts for an app within a period.
     * @param criteria
     * @returns {Promise<IStatusCodeCounts[]>}
     */
    getStatusCodeCounts(
        criteria: GetTrafficOptionsDto,
    ): Promise<IStatusCodeCounts[]>;
    /**
     * Get traffic data for an app within a period.
     * @param criteria
     * @returns {Promise<ITrafficData[]>}
     */
    getTrafficData(
        criteria: ExportTrafficCsvOptionsDto,
    ): Promise<ITrafficData[]>;
}
