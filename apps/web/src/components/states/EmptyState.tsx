import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description: string;
    icon?: LucideIcon;
    action?: ReactNode;
}

export function EmptyState({
    title,
    description,
    icon: Icon = Inbox,
    action,
}: Readonly<EmptyStateProps>) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                <Icon
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                />
            </span>
            <div>
                <p className="font-medium text-foreground">{title}</p>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
            {action}
        </div>
    );
}
