import { RestfulMethod } from '@hitapi/shared/enums';

/**
 * Returns the Tailwind colour classes for an HTTP method badge.
 */
export function getMethodBadgeClass(method: RestfulMethod): string {
    switch (method) {
        case RestfulMethod.GET:
            return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
        case RestfulMethod.POST:
            return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
        case RestfulMethod.PUT:
            return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
        case RestfulMethod.PATCH:
            return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
        case RestfulMethod.DELETE:
            return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
        default:
            return 'bg-muted text-muted-foreground border-border';
    }
}

/**
 * Returns the Tailwind colour classes for an HTTP status code badge.
 * 2xx → emerald, 3xx → blue, 4xx → amber, 5xx → rose, other → muted.
 */
export function getStatusCodeBadgeClass(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) {
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    }
    if (statusCode >= 300 && statusCode < 400) {
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25';
    }
    if (statusCode >= 400 && statusCode < 500) {
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    }
    if (statusCode >= 500) {
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
    }
    return 'bg-muted text-muted-foreground border-border';
}

/**
 * Returns the Tailwind colour classes for latency / response time badge.
 * < 300ms → emerald (fast)
 * 300ms - 1000ms → amber (moderate)
 * >= 1000ms → rose (slow)
 */
export function getLatencyBadgeClass(ms: number): string {
    if (ms < 300) {
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
    }
    if (ms < 1000) {
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
    }
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25';
}

/**
 * Returns the Tailwind colour classes for a timestamp badge.
 */
export function getTimestampBadgeClass(): string {
    return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/25';
}
