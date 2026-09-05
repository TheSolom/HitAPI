import { RotateCcw, Search, Sparkles, X } from 'lucide-react';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export interface ConsumersTableToolbarProps {
    readonly search: string;
    readonly onSearchChange: (value: string) => void;
    readonly onlyNew: boolean;
    readonly onToggleOnlyNew: () => void;
    readonly selectedGroupFilter: string;
    readonly onGroupFilterChange: (value: string) => void;
    readonly groups: readonly ConsumerGroupResponseDto[];
    readonly hasActiveFilters: boolean;
    readonly onResetFilters: () => void;
}

export function ConsumersTableToolbar({
    search,
    onSearchChange,
    onlyNew,
    onToggleOnlyNew,
    selectedGroupFilter,
    onGroupFilterChange,
    groups,
    hasActiveFilters,
    onResetFilters,
}: ConsumersTableToolbarProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name or identifier..."
                    value={search}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                    }}
                    className="pl-8.5 pr-8 h-9 text-sm"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => {
                            onSearchChange('');
                        }}
                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                {/* Quick New Client Pill */}
                <Button
                    variant={onlyNew ? 'default' : 'outline'}
                    size="sm"
                    className="h-9 gap-1.5 text-xs font-medium"
                    onClick={onToggleOnlyNew}
                >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Only New</span>
                </Button>

                {/* Group Filter Dropdown */}
                <Select
                    value={selectedGroupFilter}
                    onValueChange={onGroupFilterChange}
                >
                    <SelectTrigger className="h-9 w-40 sm:w-48 text-xs sm:text-sm">
                        <SelectValue placeholder="All groups" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Groups</SelectItem>
                        {groups.map((group) => (
                            <SelectItem
                                key={group.id}
                                value={group.id.toString()}
                            >
                                {group.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Reset Button (shows if filters active) */}
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                        onClick={onResetFilters}
                        title="Reset all filters"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Reset</span>
                    </Button>
                )}
            </div>
        </div>
    );
}
