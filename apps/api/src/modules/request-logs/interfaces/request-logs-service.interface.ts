import type { QueryRunner } from 'typeorm';
import type { CreateRequestLogDto } from '../dto/create-request-log.dto.js';
import type { GetRequestLogsOptionsDto } from '../dto/get-request-logs-options.dto.js';
import type { RequestLogResponsePaginatedDto } from '../dto/request-log-response.dto.js';
import type { GetRequestLogTimelineOptionsDto } from '../dto/get-request-log-timeline-options.dto.js';
import type { RequestLogTimelineResponseDto } from '../dto/request-log-timeline-response.dto.js';
import type { RequestLogDetailsResponseDto } from '../dto/request-log-details-response.dto.js';

export interface IRequestLogsService {
    /**
     * Create request logs
     * @param requestLogsDto
     * @param queryRunner - The query runner.
     * @returns {void}
     */
    createRequestLogs(
        requestLogsDto: CreateRequestLogDto[],
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Get request logs
     * @param getRequestLogsOptionsDto
     * @returns {RequestLogResponsePaginatedDto}
     */
    getRequestLogs(
        getRequestLogsOptionsDto: GetRequestLogsOptionsDto,
    ): Promise<RequestLogResponsePaginatedDto>;
    /**
     * Get request logs timeline
     * @param getRequestLogTimelineOptionsDto
     * @returns {RequestLogTimelineResponseDto}
     */
    getRequestLogsTimeline(
        getRequestLogTimelineOptionsDto: GetRequestLogTimelineOptionsDto,
    ): Promise<RequestLogTimelineResponseDto>;
    /**
     * Export request logs to csv
     * @param getRequestLogsDto
     * @returns {string}
     */
    exportRequestLogsCsv(
        getRequestLogsDto: GetRequestLogsOptionsDto,
    ): Promise<string>;
    /**
     * Get request log details
     * @param requestUuid
     * @param appId
     * @param timestamp
     * @returns {RequestLogDetailsResponseDto}
     */
    getRequestLogDetails(
        requestUuid: string,
        appId: string,
        timestamp?: string,
    ): Promise<RequestLogDetailsResponseDto>;
}
