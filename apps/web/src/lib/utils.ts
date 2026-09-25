import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

function formatCustomDateRange(period: string): string | null {
    if (!period.includes('|')) return null;
    const [startStr, endStr] = period.split('|');
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
        const startYear = start.getFullYear();
        const endYear = end.getFullYear();
        if (startYear === endYear) {
            return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
        }
        return `${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`;
    }
    return null;
}

const PERIOD_LABELS: Record<string, string | undefined> = {
    all: 'All time',
    '1h': 'Last hour',
    '24h': 'Last 24 hours',
    '7d': 'Last 7 days',
    '30d': 'Last 30 days',
};

const PERIOD_DESCRIPTIONS: Record<string, string | undefined> = {
    all: 'All time',
    '1h': 'In the last hour',
    '24h': 'In the last 24 hours',
    '7d': 'In the last 7 days',
    '30d': 'In the last 30 days',
};

export function formatPeriodLabel(period?: string | null): string {
    if (!period) return 'All time';
    return PERIOD_LABELS[period] ?? formatCustomDateRange(period) ?? period;
}

export function formatPeriodDescription(period?: string | null): string {
    if (!period) return 'All time';
    return (
        PERIOD_DESCRIPTIONS[period] ?? formatCustomDateRange(period) ?? period
    );
}
