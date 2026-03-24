import type { UserApp, RequestLogItem, StartupPayload } from '@hitapi/types';
import type { StartupResponseDto } from '../dto/startup-response.dto.js';

export interface IIngestionService {
    /**
     * Ingests request log items into the database.
     * @param app The app to which the request log items belong.
     * @param fileUuid The UUID of the file to which the request log items belong.
     * @param items The request log items to ingest.
     */
    ingestRequestLogs(
        app: UserApp,
        fileUuid: string,
        items: RequestLogItem[],
    ): Promise<void>;
    /**
     * Ingests startup data into the database.
     * @param app The app to which the startup data belongs.
     * @param startupPayload The startup data to ingest.
     */
    ingestStartupData(
        app: UserApp,
        startupPayload: StartupPayload,
    ): Promise<StartupResponseDto>;
}
