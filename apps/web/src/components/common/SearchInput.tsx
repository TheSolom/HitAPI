import { useCallback, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Debounce delay in milliseconds. Defaults to 0 (no debounce). */
    debounceMs?: number;
    className?: string;
}

/**
 * Reusable search input with a leading Search icon and an inline X clear button.
 * Supports optional debouncing without cascading renders.
 */
export function SearchInput({
    value,
    onChange,
    placeholder = 'Search…',
    debounceMs = 0,
    className,
}: Readonly<SearchInputProps>) {
    const [prevValue, setPrevValue] = useState(value);
    const [localValue, setLocalValue] = useState(value);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    if (value !== prevValue) {
        setPrevValue(value);
        setLocalValue(value);
    }

    const handleChange = useCallback(
        (raw: string) => {
            setLocalValue(raw);
            if (debounceMs <= 0) {
                onChange(raw);
                return;
            }
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                onChange(raw);
            }, debounceMs);
        },
        [debounceMs, onChange],
    );

    const handleClear = useCallback(() => {
        setLocalValue('');
        onChange('');
        if (timerRef.current) clearTimeout(timerRef.current);
    }, [onChange]);

    return (
        <div className={cn('relative flex-1 sm:max-w-xs', className)}>
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
                placeholder={placeholder}
                value={localValue}
                onChange={(e) => {
                    handleChange(e.target.value);
                }}
                className="pl-8.5 h-9 text-xs"
            />
            {localValue ? (
                <button
                    type="button"
                    aria-label="Clear search"
                    onClick={handleClear}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            ) : null}
        </div>
    );
}
