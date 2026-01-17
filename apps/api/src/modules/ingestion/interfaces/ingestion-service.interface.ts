import type { App } from '../../apps/entities/app.entity.js';
import type { IngestRequestLogsDto } from '../dto/ingest-request-logs.dto.js';
import type { IngestApplicationLogsDto } from '../dto/ingest-application-logs.dto.js';

export interface IIngestionService {
    /**
     * Ingests request logs into the database.
     * @param requestLogs The request logs to ingest.
     * @param app The app to which the request logs belong.
     */
    ingestRequestLogs(
        requestLogs: IngestRequestLogsDto,
        app: App,
    ): Promise<void>;
    /**
     * Ingests application logs into the database.
     * @param applicationLogs The application logs to ingest.
     * @param app The app to which the application logs belong.
     */
    ingestApplicationLogs(
        applicationLogs: IngestApplicationLogsDto,
        app: App,
    ): Promise<void>;
}
