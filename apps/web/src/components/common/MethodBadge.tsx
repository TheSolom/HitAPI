import { RestfulMethod } from '@hitapi/shared/enums';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getMethodBadgeClass } from '@/lib/badge';

export interface MethodBadgeProps {
    method: RestfulMethod;
    className?: string;
}

/**
 * HTTP method badge with semantic colour coding.
 */
export function MethodBadge({ method, className }: Readonly<MethodBadgeProps>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'font-mono text-[11px] font-semibold tracking-wider',
                getMethodBadgeClass(method),
                className,
            )}
        >
            {method}
        </Badge>
    );
}
