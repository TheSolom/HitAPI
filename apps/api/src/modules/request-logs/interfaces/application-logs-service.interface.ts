import type { ApplicationLogResponseDto } from '../dto/application-log-response.dto.js';
import type { CreateApplicationLogDto } from '../dto/create-application-log.dto.js';

export interface IApplicationLogsService {
    /**
     * Get application logs
     * @param requestUuid
     * @param appId
     * @returns {ApplicationLogResponseDto[]}
     */
    getApplicationLogs(
        requestUuid: string,
        appId: string,
    ): Promise<ApplicationLogResponseDto[]>;
    /**
     * Create multiple application logs
     * @param applicationLogDto
     * @returns {void}
     */
    createApplicationLogs(
        applicationLogDto: CreateApplicationLogDto[],
    ): Promise<void>;
}
