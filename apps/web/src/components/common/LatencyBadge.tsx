import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getLatencyBadgeClass } from '@/lib/badge';
import { formatResponseTime } from '@/lib/format';

export interface LatencyBadgeProps {
    ms: number;
    className?: string;
    /** Optional custom formatted string */
    formatted?: string;
}

/**
 * Reusable HTTP latency / response time badge with semantic colour coding.
 * Matches MethodBadge and StatusCodeBadge typography and styling:
 * 'font-mono text-[11px] font-semibold'
 *
 * < 300ms → Emerald (fast)
 * 300ms - 1000ms → Amber (moderate)
 * >= 1000ms → Rose (slow)
 */
export function LatencyBadge({
    ms,
    className,
    formatted,
}: Readonly<LatencyBadgeProps>) {
    const label = formatted ?? formatResponseTime(ms);

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-mono text-[11px] font-semibold',
                getLatencyBadgeClass(ms),
                className,
            )}
        >
            {label}
        </Badge>
    );
}

// Re-export alias for convenience
export const ResponseTimeBadge = LatencyBadge;
