import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { OrderDirection } from '@hitapi/types';
import type { SortField } from './table.utils';

export interface SortIconProps {
    readonly column: SortField;
    readonly sortBy: SortField;
    readonly order: OrderDirection;
}

export function SortIcon({ column, sortBy, order }: SortIconProps) {
    if (sortBy !== column) {
        return (
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground" />
        );
    }
    if (order === OrderDirection.ASC) {
        return (
            <ArrowUp className="h-3.5 w-3.5 text-primary animate-in fade-in-50 duration-200" />
        );
    }
    return (
        <ArrowDown className="h-3.5 w-3.5 text-primary animate-in fade-in-50 duration-200" />
    );
}
