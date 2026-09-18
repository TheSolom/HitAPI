import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TrafficStatCardProps {
    title: string;
    value: ReactNode;
    description?: ReactNode;
    icon?: LucideIcon;
    className?: string;
    valueClassName?: string;
}

export function TrafficStatCard({
    title,
    value,
    description,
    icon: Icon,
    className,
    valueClassName,
}: Readonly<TrafficStatCardProps>) {
    return (
        <Card className={cn('overflow-hidden', className)}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                </CardTitle>
                {Icon && (
                    <Icon
                        className="h-3.5 w-3.5 text-muted-foreground"
                        aria-hidden="true"
                    />
                )}
            </CardHeader>
            <CardContent className="space-y-1">
                <div
                    className={cn(
                        'text-2xl font-semibold tabular-nums tracking-tight text-foreground',
                        valueClassName,
                    )}
                >
                    {value}
                </div>
                {description && (
                    <div className="text-[11px] text-muted-foreground truncate">
                        {description}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
