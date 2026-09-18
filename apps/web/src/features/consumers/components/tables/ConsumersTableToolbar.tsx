import { RotateCcw, Sparkles } from 'lucide-react';
import type { ConsumerGroupResponseDto } from '@hitapi/types';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SearchInput } from '@/components/common';

export interface ConsumersTableToolbarProps {
    search: string;
    onSearchChange: (value: string) => void;
    onlyNew: boolean;
    onToggleOnlyNew: () => void;
    selectedGroupFilter: string;
    onGroupFilterChange: (value: string) => void;
    groups: readonly ConsumerGroupResponseDto[];
    hasActiveFilters: boolean;
    onResetFilters: () => void;
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
}: Readonly<ConsumersTableToolbarProps>) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
                placeholder="Search by name or identifier..."
                value={search}
                onChange={onSearchChange}
            />

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
                {hasActiveFilters ? (
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
                ) : null}
            </div>
        </div>
    );
}
