import type { CreateApplicationLogDto } from '../dto/create-application-log.dto.js';
import type { ApplicationLog } from '../entities/application-log.entity.js';

export interface IApplicationLogsService {
    /**
     * Create multiple application logs
     * @param applicationLogDto
     * @returns {void}
     */
    createApplicationLogs(
        applicationLogDto: CreateApplicationLogDto[],
    ): Promise<void>;
    /**
     * Get application logs
     * @param requestUuid
     * @param appId
     * @returns {ApplicationLog[]}
     */
    getApplicationLogs(
        requestUuid: string,
        appId: string,
    ): Promise<ApplicationLog[]>;
}
