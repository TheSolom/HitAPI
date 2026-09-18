import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MethodFilterSelect, SearchInput } from '@/components/common';

interface ErrorsTableToolbarProps {
    search: string;
    onSearchChange: (search: string) => void;
    methodFilter: string;
    onMethodFilterChange: (method: string) => void;
    statusFilter: string;
    onStatusFilterChange: (status: string) => void;
    onResetFilters: () => void;
    hasActiveFilters: boolean;
}

export function ErrorsTableToolbar({
    search,
    onSearchChange,
    methodFilter,
    onMethodFilterChange,
    statusFilter,
    onStatusFilterChange,
    onResetFilters,
    hasActiveFilters,
}: Readonly<ErrorsTableToolbarProps>) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <SearchInput
                    placeholder="Filter by endpoint path..."
                    value={search}
                    onChange={onSearchChange}
                    className="min-w-48 sm:max-w-xs"
                />

                {/* HTTP Method Filter */}
                <MethodFilterSelect
                    value={methodFilter}
                    onChange={onMethodFilterChange}
                />

                {/* Status Code Filter */}
                <Select
                    value={statusFilter}
                    onValueChange={onStatusFilterChange}
                >
                    <SelectTrigger className="h-9 w-36 text-xs">
                        <SelectValue placeholder="Status Code" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Errors</SelectItem>
                        <SelectItem value="4xx">4xx Client Errors</SelectItem>
                        <SelectItem value="5xx">5xx Server Errors</SelectItem>
                        <SelectItem value="400">400 Bad Request</SelectItem>
                        <SelectItem value="401">401 Unauthorized</SelectItem>
                        <SelectItem value="403">403 Forbidden</SelectItem>
                        <SelectItem value="404">404 Not Found</SelectItem>
                        <SelectItem value="422">422 Unprocessable</SelectItem>
                        <SelectItem value="429">429 Rate Limited</SelectItem>
                        <SelectItem value="500">500 Internal Error</SelectItem>
                        <SelectItem value="502">502 Bad Gateway</SelectItem>
                        <SelectItem value="503">503 Unavailable</SelectItem>
                        <SelectItem value="504">504 Gateway Timeout</SelectItem>
                    </SelectContent>
                </Select>

                {hasActiveFilters ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </Button>
                ) : null}
            </div>
        </div>
    );
}
