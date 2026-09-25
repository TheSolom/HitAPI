import type { CreateApplicationLogPayload } from '@hitapi/types';
import type { ApplicationLog } from '../entities/application-log.entity.js';

export interface IApplicationLogsService {
    /**
     * Create multiple application logs
     * @param applicationLogDto
     * @returns {void}
     */
    createApplicationLogs(
        applicationLogDto: CreateApplicationLogPayload[],
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
