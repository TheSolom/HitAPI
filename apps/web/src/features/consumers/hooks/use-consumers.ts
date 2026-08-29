import {
    keepPreviousData,
    useMutation,
    useQuery,
    useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    ConsumerMetricsResponseDto,
    ConsumerResponseDto,
    ConsumersChartResponseDto,
    GetConsumersChartOptions,
    GetTrafficConsumersTableOptions,
    Period,
    TrafficConsumersTableResponseDto,
    UpdateConsumerPayload,
} from '@hitapi/types';
import { consumersApi, type GetConsumersResponse } from '../api';
import { consumerKeys } from './consumers.keys';

export function useConsumersQuery(appId?: string) {
    return useQuery<GetConsumersResponse>({
        queryKey: consumerKeys.list(appId ?? ''),
        queryFn: ({ signal }) => {
            if (!appId) {
                throw new Error('appId is required to fetch consumers');
            }
            return consumersApi.list(appId, signal);
        },
        enabled: Boolean(appId),
    });
}

export function useConsumersTableQuery(options: Partial<GetTrafficConsumersTableOptions>) {
    return useQuery<TrafficConsumersTableResponseDto[]>({
        queryKey: consumerKeys.table(options as Record<string, unknown>),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await consumersApi.table(
                options as GetTrafficConsumersTableOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
        placeholderData: keepPreviousData,
    });
}

export function useConsumersChartQuery(options: Partial<GetConsumersChartOptions>) {
    return useQuery<ConsumersChartResponseDto[]>({
        queryKey: consumerKeys.chart(options as Record<string, unknown>),
        queryFn: async ({ signal }) => {
            if (!options.appId) {
                throw new Error('appId is required');
            }
            const res = await consumersApi.chart(
                options as GetConsumersChartOptions,
                signal,
            );
            return res.data ?? [];
        },
        enabled: Boolean(options.appId),
    });
}

export function useConsumerMetricsQuery(appId?: string, period?: Period) {
    return useQuery<ConsumerMetricsResponseDto | null>({
        queryKey: consumerKeys.metrics(appId ?? '', period),
        queryFn: async ({ signal }) => {
            if (!appId) {
                throw new Error('appId is required to fetch consumer metrics');
            }
            const res = await consumersApi.metrics(appId, period, signal);
            return res.data ?? null;
        },
        enabled: Boolean(appId),
    });
}

export function useConsumerQuery(appId?: string, consumerId?: number) {
    return useQuery<ConsumerResponseDto | null>({
        queryKey: consumerKeys.detail(appId ?? '', consumerId ?? 0),
        queryFn: async ({ signal }) => {
            if (!appId || consumerId === undefined) {
                throw new Error('appId and consumerId are required');
            }
            const res = await consumersApi.get(appId, consumerId, signal);
            return res.data ?? null;
        },
        enabled: Boolean(appId && consumerId !== undefined),
    });
}

export function useUpdateConsumerMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            appId,
            consumerId,
            payload,
        }: {
            appId: string;
            consumerId: number;
            payload: UpdateConsumerPayload;
        }) => consumersApi.update(appId, consumerId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: consumerKeys.all });
            toast.success('Consumer updated successfully');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error ? err.message : 'Failed to update consumer';
            toast.error(message);
        },
    });
}
