/**
 * Format an integer with locale commas
 */
export function formatNumber(num?: number | null): string {
    if (num === undefined || num === null || Number.isNaN(num)) {
        return '0';
    }
    return num.toLocaleString();
}

/**
 * Formats a time window string into a concise label
 */
export function formatTimeWindow(timeString: string): string {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) return timeString;

    return date.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format response time in milliseconds or seconds
 */
export function formatResponseTime(ms?: number | null): string {
    if (ms === undefined || ms === null || Number.isNaN(ms)) {
        return '0 ms';
    }
    if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)} s`;
    }
    return `${String(Math.round(ms))} ms`;
}
