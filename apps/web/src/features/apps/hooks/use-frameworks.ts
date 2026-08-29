import { useQuery } from '@tanstack/react-query';
import {
    frameworksApi,
    type GetFrameworksResponse,
    type GetFrameworkResponse,
} from '../api';
import { frameworkKeys } from './frameworks.keys';

export function useFrameworksQuery() {
    return useQuery<GetFrameworksResponse>({
        queryKey: frameworkKeys.lists(),
        queryFn: ({ signal }) => frameworksApi.list(signal),
    });
}

export function useFrameworkQuery(id: number) {
    return useQuery<GetFrameworkResponse>({
        queryKey: frameworkKeys.detail(id),
        queryFn: ({ signal }) => frameworksApi.get(id, signal),
        enabled: Boolean(id),
    });
}
