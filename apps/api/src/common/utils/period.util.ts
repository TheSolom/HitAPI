import ms, { type StringValue } from 'ms';
import type {
    RelativePeriod,
    RangePeriod,
    Period,
    ParsedPeriod,
    TruncUnit,
} from '../types/period.type.js';

/**
 * Determine the SQL DATE_TRUNC granularity based on duration
 */
function pickGranularity(durationMs: number): TruncUnit {
    const oneMinute = 60_000;
    const oneHour = 60 * oneMinute;
    const oneDay = 24 * oneHour;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    if (durationMs <= oneHour) return 'minute';
    if (durationMs <= oneDay) return 'hour';
    if (durationMs <= oneWeek) return 'day';
    if (durationMs <= oneMonth) return 'week';
    return 'month';
}

/**
 * Parse a period string into either a relative or range period
 * Ensures range start is within the last 12 months
 */
export function parsePeriod(period: RelativePeriod): ParsedPeriod;
export function parsePeriod(period: RangePeriod): ParsedPeriod;
export function parsePeriod(period: Period): ParsedPeriod;

export function parsePeriod(period: Period): ParsedPeriod {
    // Relative period (e.g., "1h", "7d")
    const duration = ms(period as StringValue);

    if (typeof duration === 'number') {
        if (duration <= 0) throw new Error('Relative period must be positive');
        return {
            type: 'relative',
            durationMs: duration,
            since: new Date(Date.now() - duration),
            granularity: pickGranularity(duration),
        };
    }

    // Absolute range (e.g., "2024-01-01|2024-01-31")
    const decoded = decodeURIComponent(period);
    const [startStr, endStr] = decoded.split('|');

    if (!startStr || !endStr) {
        throw new Error(
            'Invalid period format. Must be relative (e.g., "24h") or range (start|end)',
        );
    }

    const startDate = new Date(startStr);
    const endDate = new Date(endStr);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        throw new TypeError('Invalid date(s) in period range');
    }

    if (startDate > endDate) {
        throw new Error('Start date must be before end date');
    }

    // Enforce last 12 months limit
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    if (startDate < twelveMonthsAgo) {
        throw new Error('Start date must be within the last 12 months');
    }

    const durationMs = endDate.getTime() - startDate.getTime();

    return {
        type: 'range',
        startDate,
        endDate,
        granularity: pickGranularity(durationMs),
    };
}
