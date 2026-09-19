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

/**
 * Format Apdex score as a 2-decimal number (e.g., 0.94 or 94%)
 */
export function formatApdex(score?: number | null): string {
    if (score === undefined || score === null || Number.isNaN(score)) {
        return '0.00';
    }
    // If score is 0-100 (rate utility gives percentage), convert to 0-1 or display as decimal
    const normalized = score > 1 ? score / 100 : score;
    return normalized.toFixed(2);
}

/**
 * Get Apdex rating description based on standard Apdex thresholds
 */
export function getApdexRating(score?: number | null): {
    label: string;
    colorClass: string;
} {
    if (score === undefined || score === null || Number.isNaN(score)) {
        return { label: 'No data', colorClass: 'text-muted-foreground' };
    }
    const val = score > 1 ? score / 100 : score;
    if (val >= 0.94)
        return { label: 'Excellent', colorClass: 'text-emerald-500' };
    if (val >= 0.85) return { label: 'Good', colorClass: 'text-blue-500' };
    if (val >= 0.7) return { label: 'Fair', colorClass: 'text-amber-500' };
    if (val >= 0.5) return { label: 'Poor', colorClass: 'text-orange-500' };
    return { label: 'Unacceptable', colorClass: 'text-destructive' };
}

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
