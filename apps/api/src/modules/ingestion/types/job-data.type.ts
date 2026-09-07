import type { RequestLogItemDto } from '../dto/request-log-item.dto.js';
import type { SyncPayloadDto } from '../dto/sync-payload.dto.js';

export type BaseJobData = {
    appId?: string;
    traceId?: string;
};

export type IngestRequestLogsJobData = BaseJobData & {
    appId: string;
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestApplicationLogsJobData = BaseJobData & {
    appId: string;
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestSyncDataJobData = BaseJobData & {
    appId: string;
    payload: SyncPayloadDto;
};
