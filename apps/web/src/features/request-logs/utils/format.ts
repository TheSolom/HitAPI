import { getStatusCodeBadgeClass, getLatencyBadgeClass } from '@/lib/badge';

/**
 * Format bytes into human-readable unit
 */
export function formatBytes(bytes?: number | null): string {
    if (bytes === undefined || bytes === null || Number.isNaN(bytes))
        return '-';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(i === 0 ? 0 : 1)} ${sizes[i]}`;
}

/**
 * Format response time in milliseconds or seconds
 */
export function formatResponseTime(ms?: number | null): string {
    if (ms === undefined || ms === null || Number.isNaN(ms)) return '-';
    if (ms < 1000) return `${String(Math.round(ms))} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Re-export getLatencyBadgeClass from shared lib/badge.ts
 */
export { getLatencyBadgeClass };

/**
 * Re-export getStatusCodeBadgeClass for semantic color styling of HTTP status codes
 */
export { getStatusCodeBadgeClass as getHttpStatusBadgeClass };
