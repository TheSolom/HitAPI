export enum QUEUES {
    REQUEST_LOGS = 'request-logs',
    APPLICATION_LOGS = 'application-logs',
    SYNC_DATA = 'sync-data',
    MAILS = 'mails',
}

export enum FLOW_PRODUCERS {
    LOGS_INGESTION = 'logs-ingestion',
}

export enum JOBS {
    INGEST_REQUEST_LOGS = 'ingest-request-logs',
    INGEST_APPLICATION_LOGS = 'ingest-application-logs',
    INGEST_SYNC_DATA = 'ingest-sync-data',
    EMAIL_CONFIRMATION = 'email-confirmation',
    PASSWORD_RESET = 'password-reset',
    TEAM_INVITE = 'team-invite',
}
