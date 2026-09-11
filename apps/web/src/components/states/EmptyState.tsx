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
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border bg-muted/20 p-8 text-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">
                <Icon
                    className="h-4 w-4 text-muted-foreground"
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
