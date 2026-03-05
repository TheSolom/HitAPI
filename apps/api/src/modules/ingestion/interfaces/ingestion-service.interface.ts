import type { UserApp, RequestLogItem } from '@hitapi/types';

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
}
