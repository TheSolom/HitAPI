import { Download, Loader2, RotateCcw, ArrowUpDown } from 'lucide-react';
import { OrderDirection } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MethodFilterSelect, SearchInput } from '@/components/common';

export interface RequestLogsTableToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    method: string;
    onMethodChange: (value: string) => void;
    statusCode: string;
    onStatusCodeChange: (value: string) => void;
    order: OrderDirection;
    onOrderToggle: () => void;
    onExportCsv: () => void;
    isExporting?: boolean;
    hasActiveFilters?: boolean;
    onResetFilters?: () => void;
}

export function RequestLogsTableToolbar({
    search,
    onSearchChange,
    method,
    onMethodChange,
    statusCode,
    onStatusCodeChange,
    order,
    onOrderToggle,
    onExportCsv,
    isExporting = false,
    hasActiveFilters = false,
    onResetFilters,
}: Readonly<RequestLogsTableToolbarProps>) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                <SearchInput
                    value={search}
                    onChange={onSearchChange}
                    placeholder="Search by path, URL, or IP..."
                    className="w-full sm:w-64"
                />

                <MethodFilterSelect
                    value={method}
                    onChange={onMethodChange}
                    className="w-28"
                />

                <Select value={statusCode} onValueChange={onStatusCodeChange}>
                    <SelectTrigger className="h-9 w-32 text-xs">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="2xx">2xx Success</SelectItem>
                        <SelectItem value="3xx">3xx Redirect</SelectItem>
                        <SelectItem value="4xx">4xx Client Err</SelectItem>
                        <SelectItem value="5xx">5xx Server Err</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs gap-1.5"
                    onClick={onOrderToggle}
                    title="Toggle sort direction"
                >
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>
                        {order === OrderDirection.DESC ? 'Newest' : 'Oldest'}
                    </span>
                </Button>

                {hasActiveFilters && onResetFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        onClick={onResetFilters}
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 text-xs gap-1.5"
                    onClick={onExportCsv}
                    disabled={isExporting}
                >
                    {isExporting ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Download className="h-3.5 w-3.5" />
                    )}
                    <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </Button>
            </div>
        </div>
    );
}
