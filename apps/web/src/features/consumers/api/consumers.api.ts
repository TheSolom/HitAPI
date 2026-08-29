import { api } from '@/lib/api/client';
import type {
    ConsumerGroupResponseDto,
    ConsumerMetricsResponseDto,
    ConsumerResponseDto,
    ConsumersChartResponseDto,
    CreateConsumerGroupPayload,
    CustomResponse,
    GetConsumersChartOptions,
    GetTrafficConsumersTableOptions,
    Period,
    TrafficConsumersTableResponseDto,
    UpdateConsumerGroupPayload,
    UpdateConsumerPayload,
} from '@hitapi/types';

export type GetConsumersResponse = CustomResponse<ConsumerResponseDto[]>;
export type GetConsumerResponse = CustomResponse<ConsumerResponseDto>;
export type GetConsumerMetricsResponse =
    CustomResponse<ConsumerMetricsResponseDto>;
export type GetConsumersTableResponse = CustomResponse<
    TrafficConsumersTableResponseDto[]
>;
export type GetConsumersChartResponse = CustomResponse<
    ConsumersChartResponseDto[]
>;
export type GetConsumerGroupsResponse = CustomResponse<
    ConsumerGroupResponseDto[]
>;
export type GetConsumerGroupResponse = CustomResponse<ConsumerGroupResponseDto>;

export const consumersApi = {
    list: (appId: string, signal?: AbortSignal) =>
        api.get<GetConsumersResponse>(
            `/apps/${appId}/consumers`,
            undefined,
            signal,
        ),

    metrics: (appId: string, period?: Period, signal?: AbortSignal) =>
        api.get<GetConsumerMetricsResponse>(
            `/apps/${appId}/consumers/metrics`,
            period ? { period } : undefined,
            signal,
        ),

    table: (
        options: GetTrafficConsumersTableOptions,
        signal?: AbortSignal,
    ) =>
        api.get<GetConsumersTableResponse>(
            '/traffic/consumers-table',
            options as Record<string, unknown>,
            signal,
        ),

    chart: (
        options: GetConsumersChartOptions,
        signal?: AbortSignal,
    ) =>
        api.get<GetConsumersChartResponse>(
            '/traffic/consumers-chart',
            options as Record<string, unknown>,
            signal,
        ),

    get: (appId: string, consumerId: number, signal?: AbortSignal) =>
        api.get<GetConsumerResponse>(
            `/apps/${appId}/consumers/${String(consumerId)}`,
            undefined,
            signal,
        ),

    update: (
        appId: string,
        consumerId: number,
        payload: UpdateConsumerPayload,
    ) =>
        api.put<CustomResponse<null>>(
            `/apps/${appId}/consumers/${String(consumerId)}`,
            payload,
        ),

    groups: (appId: string, signal?: AbortSignal) =>
        api.get<GetConsumerGroupsResponse>(
            `/apps/${appId}/consumer-groups`,
            undefined,
            signal,
        ),

    getGroup: (appId: string, groupId: number, signal?: AbortSignal) =>
        api.get<GetConsumerGroupResponse>(
            `/apps/${appId}/consumer-groups/${String(groupId)}`,
            undefined,
            signal,
        ),

    createGroup: (appId: string, payload: CreateConsumerGroupPayload) =>
        api.post<GetConsumerGroupResponse>(
            `/apps/${appId}/consumer-groups`,
            payload,
        ),

    updateGroup: (
        appId: string,
        groupId: number,
        payload: UpdateConsumerGroupPayload,
    ) =>
        api.put<CustomResponse<null>>(
            `/apps/${appId}/consumer-groups/${String(groupId)}`,
            payload,
        ),

    deleteGroup: (appId: string, groupId: number) =>
        api.delete<undefined>(
            `/apps/${appId}/consumer-groups/${String(groupId)}`,
        ),
};
