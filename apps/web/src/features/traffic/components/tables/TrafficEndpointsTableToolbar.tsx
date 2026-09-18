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

export interface TrafficEndpointsTableToolbarProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedMethod: string;
    onMethodChange: (value: string) => void;
    totalCount: number;
    filteredCount: number;
    onResetFilters: () => void;
}

export function TrafficEndpointsTableToolbar({
    searchTerm,
    onSearchChange,
    selectedMethod,
    onMethodChange,
    totalCount,
    filteredCount,
    onResetFilters,
}: Readonly<TrafficEndpointsTableToolbarProps>) {
    const isFiltered = searchTerm !== '' || selectedMethod !== 'all';

    return (
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b bg-muted/10">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Filter by endpoint path..."
                        value={searchTerm}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                        }}
                        className="h-8 pl-8 text-xs"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => {
                                onSearchChange('');
                            }}
                            className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                {/* HTTP Method Filter */}
                <Select value={selectedMethod} onValueChange={onMethodChange}>
                    <SelectTrigger className="h-8 w-28 text-xs">
                        <SelectValue placeholder="Method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All methods</SelectItem>
                        <SelectItem value={RestfulMethod.GET}>GET</SelectItem>
                        <SelectItem value={RestfulMethod.POST}>POST</SelectItem>
                        <SelectItem value={RestfulMethod.PUT}>PUT</SelectItem>
                        <SelectItem value={RestfulMethod.PATCH}>
                            PATCH
                        </SelectItem>
                        <SelectItem value={RestfulMethod.DELETE}>
                            DELETE
                        </SelectItem>
                    </SelectContent>
                </Select>

                {isFiltered && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onResetFilters}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                        Reset
                    </Button>
                )}
            </div>

            <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                {isFiltered ? (
                    <span>
                        Showing <strong>{filteredCount}</strong> of {totalCount}{' '}
                        endpoints
                    </span>
                ) : (
                    <span>
                        <strong>{totalCount}</strong> endpoints total
                    </span>
                )}
            </div>
        </div>
    );
}
