import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTimestampBadgeClass } from '@/lib/badge';

export interface TimestampBadgeProps {
    date: Date | string | number;
    className?: string;
    /** Optional custom formatted string */
    formatted?: string;
}

/**
 * Reusable HTTP timestamp badge with styling matching MethodBadge, StatusCodeBadge, and LatencyBadge:
 * 'font-mono text-[11px] font-semibold'
 */
export function TimestampBadge({
    date,
    className,
    formatted,
}: Readonly<TimestampBadgeProps>) {
    const label =
        formatted ??
        new Date(date).toLocaleString(undefined, {
            dateStyle: 'short',
            timeStyle: 'medium',
        });

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-mono text-[11px] font-semibold',
                getTimestampBadgeClass(),
                className,
            )}
        >
            {label}
        </Badge>
    );
}
