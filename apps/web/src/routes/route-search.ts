import type { Period } from '@hitapi/types';
import type { RestfulMethod } from '@hitapi/shared/enums';
import type { ErrorsTab } from '@/features/errors';

/* ----------------------------- Primitive parsers ---------------------------- */

export function parseSearchString(val: unknown): string | undefined {
    if (typeof val === 'string') return val;
    if (typeof val === 'number') return String(val);
    return undefined;
}

export function parseSearchNumber(val: unknown): number | undefined {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
        const parsed = Number.parseInt(val, 10);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    return undefined;
}

/* ----------------------------- Domain parsers ------------------------------ */

export function parseErrorsTab(val: unknown): ErrorsTab {
    if (val === 'validation' || val === 'server') return val;
    return 'overview';
}

export function parseRestfulMethod(val: unknown): RestfulMethod | undefined {
    return typeof val === 'string' ? (val as RestfulMethod) : undefined;
}

/* ----------------------- Shared analytics base search --------------------- */

/**
 * Base analytics search params shared across all analytics pages
 * (Traffic, Errors, Performance, Logs, etc.)
 */
export interface AnalyticsSearch {
    appId?: string;
    period?: Period;
    consumerId?: number;
    consumerGroupId?: number;
    method?: RestfulMethod;
    path?: string;
    statusCode?: string;
}

export type TrafficSearch = AnalyticsSearch;

export function validateTrafficSearch(
    search: Record<string, unknown>,
): AnalyticsSearch {
    return {
        appId: parseSearchString(search.appId),
        period: parseSearchString(search.period),
        consumerId: parseSearchNumber(search.consumerId),
        consumerGroupId: parseSearchNumber(search.consumerGroupId),
        method: parseRestfulMethod(search.method),
        path: parseSearchString(search.path),
        statusCode: parseSearchString(search.statusCode),
    };
}

export interface ErrorsSearch extends AnalyticsSearch {
    tab?: ErrorsTab;
}

export function validateErrorsSearch(
    search: Record<string, unknown>,
): ErrorsSearch {
    return {
        ...validateTrafficSearch(search),
        tab: parseErrorsTab(search.tab),
    };
}

export type PerformanceSearch = AnalyticsSearch;

export function validatePerformanceSearch(
    search: Record<string, unknown>,
): PerformanceSearch {
    return validateTrafficSearch(search);
}

export type RequestLogsSearch = AnalyticsSearch;

export function validateRequestLogsSearch(
    search: Record<string, unknown>,
): RequestLogsSearch {
    return validateTrafficSearch(search);
}
