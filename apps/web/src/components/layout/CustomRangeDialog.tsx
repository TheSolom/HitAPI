import { useState, useId } from 'react';
import {
    format,
    subDays,
    subMonths,
    startOfDay,
    endOfDay,
    isAfter,
    isBefore,
} from 'date-fns';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface CustomRangeDialogProps {
    readonly open: boolean;
    readonly onOpenChange: (open: boolean) => void;
    readonly initialPeriod?: string;
    readonly onApply: (period: string) => void;
}

interface PresetOption {
    label: string;
    getRange: () => { from: Date; to: Date };
}

const PRESET_OPTIONS: PresetOption[] = [
    {
        label: 'Today',
        getRange: () => ({
            from: startOfDay(new Date()),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: 'Yesterday',
        getRange: () => {
            const yesterday = subDays(new Date(), 1);
            return {
                from: startOfDay(yesterday),
                to: endOfDay(yesterday),
            };
        },
    },
    {
        label: 'Last 7 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 6)),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: 'Last 14 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 13)),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: 'Last 30 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 29)),
            to: endOfDay(new Date()),
        }),
    },
    {
        label: 'Last 90 days',
        getRange: () => ({
            from: startOfDay(subDays(new Date(), 89)),
            to: endOfDay(new Date()),
        }),
    },
];

function formatDateForInput(date?: Date): string {
    if (!date || Number.isNaN(date.getTime())) {
        return '';
    }
    return format(date, 'yyyy-MM-dd');
}

function parseInputDate(value: string): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function getInitialRange(period?: string): DateRange {
    if (period?.includes('|')) {
        const [startStr, endStr] = period.split('|');
        const start = new Date(startStr);
        const end = new Date(endStr);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
            return { from: start, to: end };
        }
    }
    return {
        from: startOfDay(subDays(new Date(), 7)),
        to: endOfDay(new Date()),
    };
}

export function CustomRangeDialog({
    open,
    onOpenChange,
    initialPeriod,
    onApply,
}: CustomRangeDialogProps) {
    const startDateId = useId();
    const endDateId = useId();

    const [range, setRange] = useState<DateRange | undefined>(() =>
        getInitialRange(initialPeriod),
    );
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const startDateInput = formatDateForInput(range?.from);
    const endDateInput = formatDateForInput(range?.to);

    const handleStartDateChange = (val: string) => {
        setErrorMessage(null);
        const parsed = parseInputDate(val);
        if (parsed) {
            setRange((prev) => ({
                from: startOfDay(parsed),
                to: prev?.to,
            }));
        } else if (!val) {
            setRange((prev) => ({
                from: undefined,
                to: prev?.to,
            }));
        }
    };

    const handleEndDateChange = (val: string) => {
        setErrorMessage(null);
        const parsed = parseInputDate(val);
        if (parsed) {
            setRange((prev) => ({
                from: prev?.from,
                to: endOfDay(parsed),
            }));
        } else if (!val) {
            setRange((prev) => ({
                from: prev?.from,
                to: undefined,
            }));
        }
    };

    const handleSelectPreset = (preset: PresetOption) => {
        const newRange = preset.getRange();
        setRange(newRange);
        setErrorMessage(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (nextOpen) {
            setRange(getInitialRange(initialPeriod));
            setErrorMessage(null);
        }
        onOpenChange(nextOpen);
    };

    const handleApply = () => {
        const fromDate = range?.from;
        const toDate = range?.to ?? range?.from;

        if (!fromDate) {
            setErrorMessage('Please select a start date.');
            return;
        }

        if (!toDate) {
            setErrorMessage('Please select an end date.');
            return;
        }

        const normalizedFrom = startOfDay(fromDate);
        const normalizedTo = endOfDay(toDate);

        if (isAfter(normalizedFrom, normalizedTo)) {
            setErrorMessage('Start date must be before or equal to end date.');
            return;
        }

        const twelveMonthsAgo = subMonths(new Date(), 12);
        if (isBefore(normalizedFrom, twelveMonthsAgo)) {
            setErrorMessage('Start date must be within the last 12 months.');
            return;
        }

        const formattedPeriod = `${normalizedFrom.toISOString()}|${normalizedTo.toISOString()}`;
        onApply(formattedPeriod);
        onOpenChange(false);
    };

    const minDateLimit = formatDateForInput(subMonths(new Date(), 12));
    const maxDateLimit = formatDateForInput(new Date());

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md sm:p-6">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        Custom Date Range
                    </DialogTitle>
                    <DialogDescription>
                        Select or enter a date range to filter metrics and logs.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-1">
                    {/* Quick Presets */}
                    <div className="space-y-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Quick presets
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {PRESET_OPTIONS.map((preset) => (
                                <Button
                                    key={preset.label}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 text-xs font-normal"
                                    onClick={() => {
                                        handleSelectPreset(preset);
                                    }}
                                >
                                    {preset.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1.5">
                            <Label
                                htmlFor={startDateId}
                                className="text-xs font-medium"
                            >
                                Start Date
                            </Label>
                            <Input
                                id={startDateId}
                                type="date"
                                value={startDateInput}
                                min={minDateLimit}
                                max={maxDateLimit}
                                onChange={(e) => {
                                    handleStartDateChange(e.target.value);
                                }}
                                className="h-9 text-xs"
                                aria-label="Start date"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label
                                htmlFor={endDateId}
                                className="text-xs font-medium"
                            >
                                End Date
                            </Label>
                            <Input
                                id={endDateId}
                                type="date"
                                value={endDateInput}
                                min={startDateInput || minDateLimit}
                                max={maxDateLimit}
                                onChange={(e) => {
                                    handleEndDateChange(e.target.value);
                                }}
                                className="h-9 text-xs"
                                aria-label="End date"
                            />
                        </div>
                    </div>

                    {errorMessage ? (
                        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-2.5 text-xs text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    ) : null}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleApply}>
                        Apply Range
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
