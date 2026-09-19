export const performanceKeys = {
    all: ['performance'] as const,
    metrics: (options: Record<string, unknown>) =>
        [...performanceKeys.all, 'metrics', options] as const,
    apdexScoreChart: (options: Record<string, unknown>) =>
        [...performanceKeys.all, 'apdex-score-chart', options] as const,
    responseTimeChart: (options: Record<string, unknown>) =>
        [...performanceKeys.all, 'response-time-chart', options] as const,
    endpointsTable: (options: Record<string, unknown>) =>
        [...performanceKeys.all, 'endpoints-table', options] as const,
};
