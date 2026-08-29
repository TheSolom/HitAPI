export const consumerKeys = {
    all: ['consumers'] as const,
    lists: () => [...consumerKeys.all, 'list'] as const,
    list: (appId: string) => [...consumerKeys.lists(), appId] as const,
    details: () => [...consumerKeys.all, 'detail'] as const,
    detail: (appId: string, consumerId: number) =>
        [...consumerKeys.details(), appId, consumerId] as const,
    groups: () => [...consumerKeys.all, 'groups'] as const,
    groupsList: (appId: string) =>
        [...consumerKeys.groups(), 'list', appId] as const,
    groupDetail: (appId: string, groupId: number) =>
        [...consumerKeys.groups(), 'detail', appId, groupId] as const,
    metrics: (appId: string, period?: string) =>
        [...consumerKeys.all, 'metrics', appId, period ?? 'all'] as const,
    table: (options: Record<string, unknown>) =>
        [...consumerKeys.all, 'table', options] as const,
    chart: (options: Record<string, unknown>) =>
        [...consumerKeys.all, 'chart', options] as const,
};
