import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getStatusCodeBadgeClass } from '@/lib/badge';

export interface StatusCodeBadgeProps {
    statusCode: number;
    className?: string;
    /** Optional text status label, e.g. "OK", "Not Found" */
    statusText?: string;
    /** Show description next to number (e.g. "200 OK") */
    showText?: boolean;
}

/**
 * Reusable HTTP status code badge with semantic color coding.
 * 2xx → Emerald (success)
 * 3xx → Blue (redirection)
 * 4xx → Amber (client error)
 * 5xx → Rose (server error)
 * other → Muted
 */
export function StatusCodeBadge({
    statusCode,
    className,
    statusText,
    showText = false,
}: Readonly<StatusCodeBadgeProps>) {
    const textLabel = showText && statusText ? ` ${statusText}` : '';

    return (
        <Badge
            variant="outline"
            className={cn(
                'font-mono text-[11px] font-semibold',
                getStatusCodeBadgeClass(statusCode),
                className,
            )}
        >
            {statusCode}
            {textLabel}
        </Badge>
    );
}
