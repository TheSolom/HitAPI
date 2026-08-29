import type { RestfulMethod } from '@hitapi/shared/enums';
import type { OrderDirection } from './common.js';
import type { Period } from './period.js';

export type ConsumerInfo = {
    identifier: string;
    name?: string;
    group?: string;
    hidden?: boolean;
};

export interface ConsumerGroupResponseDto {
    id: number;
    name: string;
    consumerCount?: number;
}

export interface ConsumerResponseDto {
    id: number;
    identifier: string;
    name?: string | null;
    group: ConsumerGroupResponseDto | null;
}

export interface CreateConsumerPayload {
    identifier: string;
    name?: string;
    groupId?: number;
    hidden?: boolean;
}

export interface UpdateConsumerPayload {
    name: string;
    consumerGroupId?: number | null;
}

export interface CreateConsumerGroupPayload {
    name: string;
    consumerIds?: number[];
}

export interface UpdateConsumerGroupPayload {
    name: string;
    consumerIds?: number[] | null;
}

export interface ConsumerMetricsResponseDto {
    totalConsumers: number;
    newConsumers: number;
}

export interface TrafficConsumersTableResponseDto {
    id: number;
    identifier: string;
    name: string;
    group?: ConsumerGroupResponseDto;
    requests: number;
    errorRate: number;
    firstRequestAt: string;
    lastRequestAt: string;
    isNew: boolean;
}

export type ConsumerStatus = 'New' | 'Existing';

export interface ConsumersChartResponseDto {
    consumer_status?: ConsumerStatus;
    timeWindows: string[];
    consumerCounts: number[];
}

export interface GetTrafficConsumersTableOptions {
    appId: string;
    consumerGroupId?: number;
    consumerId?: number;
    method?: RestfulMethod;
    onlyNew?: boolean;
    path?: string;
    pathExact?: boolean;
    period?: Period;
    search?: string;
    sortBy?: 'name' | 'requests' | 'errorRate' | 'lastRequest';
    order?: OrderDirection;
    statusCode?: string;
}

export interface GetConsumersChartOptions {
    appId: string;
    consumerGroupId?: number;
    consumerId?: number;
    method?: RestfulMethod;
    path?: string;
    pathExact?: boolean;
    period?: Period;
    statusCode?: string;
}
