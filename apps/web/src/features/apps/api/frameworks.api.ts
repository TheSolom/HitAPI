import { api } from '@/lib/api/client';
import type {
    CustomResponse,
    FrameworkDto,
    CreateFrameworkPayload,
    UpdateFrameworkPayload,
} from '@hitapi/types';

export type GetFrameworksResponse = CustomResponse<FrameworkDto[]>;
export type GetFrameworkResponse = CustomResponse<FrameworkDto>;

export const frameworksApi = {
    list: (signal?: AbortSignal) =>
        api.get<GetFrameworksResponse>('/frameworks', undefined, signal),

    get: (id: number, signal?: AbortSignal) =>
        api.get<GetFrameworkResponse>(
            `/frameworks/${String(id)}`,
            undefined,
            signal,
        ),

    create: (payload: CreateFrameworkPayload) =>
        api.post<GetFrameworkResponse>('/frameworks', payload),

    update: (id: number, payload: UpdateFrameworkPayload) =>
        api.patch<GetFrameworkResponse>(
            `/frameworks/${String(id)}`,
            payload,
        ),

    remove: (id: number) =>
        api.delete<undefined>(`/frameworks/${String(id)}`),
};
