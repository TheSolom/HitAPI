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
