import type { RequestLogItemDto } from '../dto/request-log-item.dto.js';

export type IngestRequestLogsJobData = {
    appId: string;
    fileUuid: string;
    items: RequestLogItemDto[];
};

export type IngestApplicationLogsJobData = {
    fileUuid: string;
    items: RequestLogItemDto[];
};
