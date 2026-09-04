import { useCallback } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface TargetResponseTimeSliderProps {
    readonly value: number | null | undefined;
    readonly onChange: (value: number) => void;
    readonly min?: number;
    readonly max?: number;
    readonly step?: number;
    readonly sliderMax?: number;
    readonly className?: string;
    readonly disabled?: boolean;
}

const PRESETS = [
    { label: '100ms', value: 100, desc: 'Fast' },
    { label: '250ms', value: 250, desc: 'Web API' },
    { label: '500ms', value: 500, desc: 'Default' },
    { label: '1000ms', value: 1000, desc: '1.0s' },
    { label: '2000ms', value: 2000, desc: '2.0s' },
] as const;

function snapToStep(
    val: number,
    step: number,
    min: number,
    max: number,
): number {
    if (Number.isNaN(val)) return min;
    const clamped = Math.max(min, Math.min(max, val));
    const remainder = (clamped - min) % step;
    if (remainder === 0) return clamped;

    // Round to nearest step multiple
    if (remainder >= step / 2) {
        return Math.min(max, clamped + (step - remainder));
    }
    return Math.max(min, clamped - remainder);
}

export function TargetResponseTimeSlider({
    value,
    onChange,
    min = 10,
    max = 60000,
    step = 10,
    sliderMax = 5000,
    className,
    disabled = false,
}: Readonly<TargetResponseTimeSliderProps>) {
    const currentValue =
        typeof value === 'number' && !Number.isNaN(value) ? value : 500;
    const sliderValue = Math.min(currentValue, sliderMax);

    const handleSliderChange = useCallback(
        (values: number[]) => {
            if (values.length > 0) {
                const snapped = snapToStep(values[0], step, min, max);
                onChange(snapped);
            }
        },
        [onChange, step, min, max],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const raw = e.target.value;
            if (raw === '') {
                onChange(min);
                return;
            }
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) {
                // While typing allow the exact number, but ensure step on blur/submit
                onChange(parsed);
            }
        },
        [onChange, min],
    );

    const handleInputBlur = useCallback(() => {
        const snapped = snapToStep(currentValue, step, min, max);
        onChange(snapped);
    }, [currentValue, onChange, step, min, max]);

    const formattedSeconds = (currentValue / 1000).toFixed(
        currentValue >= 1000 ? 1 : 2,
    );
    const toleratingThreshold = currentValue * 4;

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center gap-3">
                <Slider
                    value={[sliderValue]}
                    min={min}
                    max={sliderMax}
                    step={step}
                    disabled={disabled}
                    onValueChange={handleSliderChange}
                    aria-label="Target response time in milliseconds"
                    className="flex-1"
                />
                <div className="flex items-center gap-1.5 shrink-0">
                    <Input
                        type="number"
                        min={min}
                        max={max}
                        step={step}
                        value={currentValue}
                        disabled={disabled}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="h-9 w-24 text-right font-mono font-medium"
                        aria-label="Target response time value in milliseconds"
                    />
                    <span className="text-xs font-semibold text-muted-foreground">
                        ms
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                    {PRESETS.map((preset) => {
                        const isSelected = currentValue === preset.value;
                        return (
                            <Button
                                key={preset.value}
                                type="button"
                                variant={isSelected ? 'secondary' : 'outline'}
                                size="sm"
                                disabled={disabled}
                                className={cn(
                                    'h-6 px-2 text-xs font-mono transition-colors',
                                    isSelected &&
                                        'border-primary/50 font-semibold text-primary',
                                )}
                                onClick={() => {
                                    onChange(preset.value);
                                }}
                            >
                                {preset.label}
                            </Button>
                        );
                    })}
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] font-normal"
                    >
                        Satisfied: &le; {currentValue}ms ({formattedSeconds}s)
                    </Badge>
                    <span className="text-muted-foreground/60">&bull;</span>
                    <Badge
                        variant="outline"
                        className="h-5 px-1.5 text-[10px] font-normal"
                    >
                        Tolerating: &le; {toleratingThreshold}ms
                    </Badge>
                </div>
            </div>
        </div>
    );
}
