import { Search, X } from 'lucide-react';
import { RestfulMethod } from '@hitapi/shared/enums';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ErrorsTableToolbarProps {
    readonly search: string;
    readonly onSearchChange: (search: string) => void;
    readonly methodFilter: string;
    readonly onMethodFilterChange: (method: string) => void;
    readonly statusFilter: string;
    readonly onStatusFilterChange: (status: string) => void;
    readonly onResetFilters: () => void;
    readonly hasActiveFilters: boolean;
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
}: ErrorsTableToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <div className="relative flex-1 min-w-48 sm:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by endpoint path..."
                        value={search}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                        }}
                        className="pl-8.5 h-9 text-xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                onSearchChange('');
                            }}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* HTTP Method Filter */}
                <Select
                    value={methodFilter}
                    onValueChange={onMethodFilterChange}
                >
                    <SelectTrigger className="h-9 w-32 text-xs">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        {Object.values(RestfulMethod).map((m) => (
                            <SelectItem key={m} value={m}>
                                {m}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

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

                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-9 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
                    >
                        <X className="h-3.5 w-3.5" />
                        Reset
                    </Button>
                )}
            </div>
        </div>
    );
}
