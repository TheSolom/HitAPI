export const errorKeys = {
    all: ['errors'] as const,
    metrics: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'metrics', options] as const,
    chart: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'chart', options] as const,
    byConsumerChart: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'by-consumer-chart', options] as const,
    ratesChart: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'rates-chart', options] as const,
    table: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'table', options] as const,
    details: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'details', options] as const,
    validationErrorsTable: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'validation-errors-table', options] as const,
    serverErrorsTable: (options: Record<string, unknown>) =>
        [...errorKeys.all, 'server-errors-table', options] as const,
};
