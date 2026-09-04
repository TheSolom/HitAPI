import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { RestfulMethod } from '@hitapi/shared/enums';
import type {
    GetEndpointConfigQuery,
    GetEndpointsQuery,
    UpdateEndpointConfigPayload,
    UpdateEndpointErrorConfigPayload,
} from '@hitapi/types';
import {
    endpointsApi,
    type GetEndpointsResponse,
    type GetEndpointResponse,
    type GetEndpointConfigResponse,
} from '../api';
import { endpointKeys } from './endpoints.keys';

export function useEndpointsQuery(appId?: string, params?: GetEndpointsQuery) {
    return useQuery<GetEndpointsResponse>({
        queryKey: endpointKeys.list(appId ?? '', params),
        queryFn: ({ signal }) => {
            if (!appId) {
                throw new Error('appId is required to fetch endpoints');
            }
            return endpointsApi.list(appId, params, signal);
        },
        enabled: Boolean(appId),
    });
}

export function useEndpointQuery(appId?: string, endpointId?: string) {
    return useQuery<GetEndpointResponse>({
        queryKey: endpointKeys.detail(appId ?? '', endpointId ?? ''),
        queryFn: ({ signal }) => {
            if (!appId || !endpointId) {
                throw new Error('appId and endpointId are required');
            }
            return endpointsApi.get(appId, endpointId, signal);
        },
        enabled: Boolean(appId && endpointId),
    });
}

export function useEndpointConfigQuery(
    appId?: string,
    params?: GetEndpointConfigQuery,
) {
    const fallbackParams: GetEndpointConfigQuery = {
        method: RestfulMethod.GET,
        path: '',
    };
    return useQuery<GetEndpointConfigResponse>({
        queryKey: endpointKeys.config(appId ?? '', params ?? fallbackParams),
        queryFn: ({ signal }) => {
            if (!appId || !params) {
                throw new Error('appId and config params are required');
            }
            return endpointsApi.getConfig(appId, params, signal);
        },
        enabled: Boolean(appId && params?.method && params.path),
    });
}

export function useUpdateEndpointConfigMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            appId,
            payload,
        }: {
            appId: string;
            payload: UpdateEndpointConfigPayload;
        }) => endpointsApi.updateConfig(appId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: endpointKeys.all });
            toast.success('Endpoint settings saved');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to save endpoint settings';
            toast.error(message);
        },
    });
}

export function useUpdateEndpointErrorConfigMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({
            appId,
            payload,
        }: {
            appId: string;
            payload: UpdateEndpointErrorConfigPayload;
        }) => endpointsApi.updateErrorConfig(appId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: endpointKeys.all });
            toast.success('Endpoint error policy saved');
        },
        onError: (err: unknown) => {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Failed to save error policy';
            toast.error(message);
        },
    });
}
