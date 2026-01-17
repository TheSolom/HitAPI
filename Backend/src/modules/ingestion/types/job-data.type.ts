import type { IngestRequestLogsDto } from '../dto/ingest-request-logs.dto.js';
import type { IngestApplicationLogsDto } from '../dto/ingest-application-logs.dto.js';

export type IngestRequestLogsJobData = {
    appId: string;
    requests: IngestRequestLogsDto['requests'];
    timestamp: Date;
};

export type IngestApplicationLogsJobData = {
    appId: string;
    logs: IngestApplicationLogsDto['logs'];
    timestamp: Date;
};
