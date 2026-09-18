import { TableCell, TableRow } from '@/components/ui/table';
import { LoadingRows } from '@/components/states/LoadingState';
import { cn } from '@/lib/utils';

export interface TableLoadingRowsProps {
    colSpan: number;
    rows?: number;
    className?: string;
}

export function TableLoadingRows({
    colSpan,
    rows = 5,
    className,
}: Readonly<TableLoadingRowsProps>) {
    return (
        <TableRow>
            <TableCell colSpan={colSpan} className={cn('p-6', className)}>
                <LoadingRows rows={rows} />
            </TableCell>
        </TableRow>
    );
}
