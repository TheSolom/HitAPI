import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatPeriodLabel(period?: string | null): string {
    if (!period || period === 'all') return 'All time';
    if (period === '1h') return 'Last hour';
    if (period === '24h') return 'Last 24 hours';
    if (period === '7d') return 'Last 7 days';
    if (period === '30d') return 'Last 30 days';
    if (period.includes('|')) {
        const [startStr, endStr] = period.split('|');
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            if (startYear === endYear) {
                return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
            }
            return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
        }
    }
    return period;
}

export function formatPeriodDescription(period?: string | null): string {
    if (!period || period === 'all') return 'All time';
    if (period === '1h') return 'In the last hour';
    if (period === '24h') return 'In the last 24 hours';
    if (period === '7d') return 'In the last 7 days';
    if (period === '30d') return 'In the last 30 days';
    if (period.includes('|')) {
        const [startStr, endStr] = period.split('|');
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            const startYear = start.getFullYear();
            const endYear = end.getFullYear();
            if (startYear === endYear) {
                return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
            }
            return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
        }
    }
    return period;
}

