import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateAppPayload, UpdateAppPayload } from '@hitapi/types';
import { appsApi } from '../api';
import { appKeys } from './apps.keys';

export function useCreateAppMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateAppPayload) => appsApi.create(payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: appKeys.all });
            toast.success('App created successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to create app');
        },
    });
}

export function useUpdateAppMutation(appId: string) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateAppPayload) =>
            appsApi.update(appId, payload),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: appKeys.all });
            toast.success('App updated successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to update app');
        },
    });
}

export function useDeleteAppMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (appId: string) => appsApi.remove(appId),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: appKeys.all });
            toast.success('App deleted successfully');
        },
        onError: (error: Error) => {
            toast.error(error.message || 'Failed to delete app');
        },
    });
}
