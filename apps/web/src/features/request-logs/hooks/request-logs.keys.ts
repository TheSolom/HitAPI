export const requestLogsKeys = {
    all: ['request-logs'] as const,
    list: (options: Record<string, unknown>) =>
        [...requestLogsKeys.all, 'list', options] as const,
    timeline: (options: Record<string, unknown>) =>
        [...requestLogsKeys.all, 'timeline', options] as const,
    details: (requestUuid: string, appId: string, timestamp?: string) =>
        [
            ...requestLogsKeys.all,
            'details',
            requestUuid,
            appId,
            timestamp,
        ] as const,
    applicationLogs: (requestUuid: string, appId: string) =>
        [
            ...requestLogsKeys.all,
            'application-logs',
            requestUuid,
            appId,
        ] as const,
};
