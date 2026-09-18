import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface TableWrapperProps {
    children: ReactNode;
    className?: string;
}

export function TableWrapper({
    children,
    className,
}: Readonly<TableWrapperProps>) {
    return (
        <div
            className={cn(
                'rounded-md border bg-card overflow-hidden',
                className,
            )}
        >
            {children}
        </div>
    );
}
