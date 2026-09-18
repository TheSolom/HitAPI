import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ActiveStatusBadgeProps {
    active: boolean;
    className?: string;
}

/**
 * Active / Inactive status badge with emerald/muted color coding.
 */
export function ActiveStatusBadge({
    active,
    className,
}: Readonly<ActiveStatusBadgeProps>) {
    return (
        <Badge
            variant="outline"
            className={cn(
                'font-medium',
                active
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                    : 'text-muted-foreground',
                className,
            )}
        >
            {active ? 'Active' : 'Inactive'}
        </Badge>
    );
}
