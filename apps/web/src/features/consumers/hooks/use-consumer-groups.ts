import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
    ConsumerGroupResponseDto,
    CreateConsumerGroupPayload,
    UpdateConsumerGroupPayload,
} from '@hitapi/types';
import { consumersApi, type GetConsumerGroupsResponse } from '../api';
import { consumerKeys } from './consumers.keys';

export function useConsumerGroupsQuery(appId?: string) {
    return useQuery<GetConsumerGroupsResponse>({
        queryKey: consumerKeys.groupsList(appId ?? ''),
        queryFn: ({ signal }) => {
            if (!appId) {
                throw new Error('appId is required to fetch consumer groups');
            }
            return consumersApi.groups(appId, signal);
        },
        enabled: Boolean(appId),
    });
}

export function useConsumerGroupQuery(appId?: string, groupId?: number) {
    return useQuery<ConsumerGroupResponseDto | null>({
        queryKey: consumerKeys.groupDetail(appId ?? '', groupId ?? 0),
        queryFn: async ({ signal }) => {
            if (!appId || groupId === undefined) {
                throw new Error('appId and groupId are required');
            }
            const res = await consumersApi.getGroup(appId, groupId, signal);
            return res.data ?? null;
        },
        enabled: Boolean(appId && groupId !== undefined),
    });
}

export function useCreateConsumerGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation<
        ConsumerGroupResponseDto | null,
        Error,
        { appId: string; payload: CreateConsumerGroupPayload }
    >({
        mutationFn: async ({ appId, payload }) => {
            const res = await consumersApi.createGroup(appId, payload);
            return res.data ?? null;
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: consumerKeys.all });
            toast.success('Consumer group created successfully');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to create consumer group';
            toast.error(message);
        },
    });
}

export function useUpdateConsumerGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            appId,
            groupId,
            payload,
        }: {
            appId: string;
            groupId: number;
            payload: UpdateConsumerGroupPayload;
        }) => consumersApi.updateGroup(appId, groupId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: consumerKeys.all });
            toast.success('Consumer group updated successfully');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to update consumer group';
            toast.error(message);
        },
    });
}

export function useDeleteConsumerGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            appId,
            groupId,
        }: {
            appId: string;
            groupId: number;
        }) => consumersApi.deleteGroup(appId, groupId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: consumerKeys.all });
            toast.success('Consumer group deleted');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to delete consumer group';
            toast.error(message);
        },
    });
}
