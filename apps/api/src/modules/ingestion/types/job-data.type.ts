import type { RequestLogItemDto } from '../dto/request-log-item.dto.js';
import type { SyncPayloadDto } from '../dto/sync-payload.dto.js';

export type BaseJobData = {
    appId: string;
    traceId?: string;
};

export type IngestRequestLogsJobData = BaseJobData & {
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestApplicationLogsJobData = BaseJobData & {
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestSyncDataJobData = BaseJobData & {
    payload: SyncPayloadDto;
};
