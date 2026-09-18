export const trafficKeys = {
    all: ['traffic'] as const,
    metrics: (options: Record<string, unknown>) =>
        [...trafficKeys.all, 'metrics', options] as const,
    requestsChart: (options: Record<string, unknown>) =>
        [...trafficKeys.all, 'requests-chart', options] as const,
    requestsPerMinuteChart: (options: Record<string, unknown>) =>
        [...trafficKeys.all, 'requests-per-minute-chart', options] as const,
    dataTransferredChart: (options: Record<string, unknown>) =>
        [...trafficKeys.all, 'data-transferred-chart', options] as const,
    endpointsTable: (options: Record<string, unknown>) =>
        [...trafficKeys.all, 'endpoints-table', options] as const,
};
