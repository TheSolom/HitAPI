import type { CreateApplicationLogDto } from '../dto/create-application-log.dto.js';
import type { ApplicationLog } from '../entities/application-log.entity.js';
import type { LogCountByLevel } from './log-count-by-level.interface.js';

export interface IApplicationLogsRepository {
    /**
     * Create multiple application logs
     * @param logs
     * @returns {Promise<void>}
     */
    createApplicationLogs(logs: CreateApplicationLogDto[]): Promise<void>;
    /**
     * Find log counts grouped by level for multiple request UUIDs
     * @param requestUuids
     * @returns {Promise<LogCountByLevel[]>}
     */
    findLogCountsByRequestUuids(
        requestUuids: string[],
    ): Promise<LogCountByLevel[]>;
    /**
     * Count all application logs for a specific request
     * @param requestUuid
     * @returns {Promise<number>}
     */
    countByRequestUuid(requestUuid: string): Promise<number>;
    /**
     * Find log counts by level for a single request
     * @param requestUuid
     * @returns {Promise<{ level: string; count: string }[]>}
     */
    findLogCountsByLevel(
        requestUuid: string,
    ): Promise<{ level: string; count: string }[]>;
    /**
     * Find application logs by request UUID with app validation
     * @param requestUuid
     * @param appId
     * @returns {Promise<ApplicationLog[]>}
     */
    findByRequestUuidAndAppId(
        requestUuid: string,
        appId: string,
    ): Promise<ApplicationLog[]>;
}
