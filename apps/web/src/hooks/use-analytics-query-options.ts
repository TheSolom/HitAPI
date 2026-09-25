import { useEffect, useMemo } from 'react';
import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import { useUiStore } from '@/stores/ui-store';

export interface AnalyticsFilterParams {
    appId?: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    statusCode?: string;
}

export function useAnalyticsQueryOptions(params: AnalyticsFilterParams) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const setActiveAppId = useUiStore((s) => s.setActiveAppId);
    const storePeriod = useUiStore((s) => s.period);

    useEffect(() => {
        if (params.appId && activeAppId !== params.appId) {
            setActiveAppId(params.appId);
        }
    }, [params.appId, activeAppId, setActiveAppId]);

    const resolvedAppId = params.appId ?? activeAppId ?? '';
    const resolvedPeriod = params.period ?? storePeriod;

    const queryOptions = useMemo(
        () => ({
            appId: resolvedAppId,
            period: resolvedPeriod,
            consumerId: params.consumerId,
            consumerGroupId: params.consumerGroupId,
            method: params.method,
            path: params.path,
            statusCode: params.statusCode,
        }),
        [
            resolvedAppId,
            resolvedPeriod,
            params.consumerId,
            params.consumerGroupId,
            params.method,
            params.path,
            params.statusCode,
        ],
    );

    return {
        resolvedAppId,
        resolvedPeriod,
        queryOptions,
    };
}
