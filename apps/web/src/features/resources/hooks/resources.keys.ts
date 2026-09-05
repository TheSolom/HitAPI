import type { GetCpuMemoryChartOptions } from '@hitapi/types';

export const resourceKeys = {
    all: ['resources'] as const,
    metrics: (appId: string) => ['resources', 'metrics', appId] as const,
    chart: (options: Partial<GetCpuMemoryChartOptions>) =>
        ['resources', 'chart', options] as const,
};
