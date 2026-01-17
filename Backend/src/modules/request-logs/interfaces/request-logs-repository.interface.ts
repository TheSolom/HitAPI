import type { StringValue } from 'ms';
import type { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import type { FindOptions } from '../../../common/@types/find-options.type.js';
import type { NullableType } from '../../../common/@types/nullable.type.js';
import type { RequestLog } from '../entities/request-log.entity.js';
import type { CreateRequestLogDto } from '../dto/create-request-log.dto.js';

export interface PartialRequestLog {
    requestUuid: string;
    method: RestfulMethods;
    path: string;
    url: string;
    statusCode: number;
    responseTime: number;
    responseSize: number;
    timestamp: Date;
    statusText?: string;
    requestSize?: number;
    clientIp?: string;
    clientCountryCode?: string;
    clientCountryName?: string;
    consumerId?: number;
    consumerName?: string;
}

export interface TimelineRawResult {
    timeWindow: string;
    itemCount: string;
}

export interface RequestLogFilterCriteria {
    appId: string;
    consumerId?: number;
    consumerGroupId?: number;
    method?: string;
    path?: string;
    pathExact?: boolean;
    statusCode?: number;
    period?: StringValue;
    url?: string;
    minRequestSize?: number;
    maxRequestSize?: number;
    minResponseSize?: number;
    maxResponseSize?: number;
    minResponseTime?: number;
    maxResponseTime?: number;
    requestBody?: string;
    responseBody?: string;
    clientIp?: string;
    minTimestamp?: string;
    maxTimestamp?: string;
    logLevel?: string;
}

export interface IRequestLogsRepository {
    /**
     * Create multiple request logs
     * @param createRequestLogsDto
     * @returns {Promise<void>}
     */
    createRequestLogs(
        createRequestLogsDto: CreateRequestLogDto[],
    ): Promise<void>;
    /**
     * Find request logs with filtering, pagination and ordering
     * @param criteria
     * @param pagination
     * @returns {Promise<{ items: PartialRequestLog[]; totalItems: number }>}
     */
    findWithFilters(
        criteria: RequestLogFilterCriteria,
        pagination: Pick<FindOptions, 'order' | 'skip' | 'take'>,
    ): Promise<{ items: PartialRequestLog[]; totalItems: number }>;
    /**
     * Find timeline aggregated data for chart
     * @param criteria
     * @returns {Promise<TimelineRawResult[]>}
     */
    findTimelineData(
        criteria: RequestLogFilterCriteria,
    ): Promise<TimelineRawResult[]>;
    /**
     * Find a single request log by UUID with app validation
     * @param requestUuid
     * @param appId
     * @param timestamp
     * @returns {NullableType<RequestLog>}
     */
    findByRequestUuid(
        requestUuid: string,
        appId: string,
        timestamp?: string,
    ): Promise<NullableType<RequestLog>>;
}
