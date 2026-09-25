import { Button } from '@/components/ui/button';

export interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
    goToPrevPage: () => void;
    goToNextPage: () => void;
}

export function TablePagination({
    currentPage,
    totalPages,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
}: Readonly<TablePaginationProps>) {
    return (
        <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground">
            <div>
                Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage}
                    onClick={goToPrevPage}
                    className="h-7 text-xs"
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage}
                    onClick={goToNextPage}
                    className="h-7 text-xs"
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
