import type { RequestLogItemDto } from '../dto/request-log-item.dto.js';
import type { SyncPayloadDto } from '../dto/sync-payload.dto.js';

export type IngestRequestLogsJobData = {
    appId: string;
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestApplicationLogsJobData = {
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestSyncDataJobData = {
    appId: string;
    payload: SyncPayloadDto;
};
