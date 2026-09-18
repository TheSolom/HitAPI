import { RestfulMethod } from '@hitapi/shared/enums';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface MethodFilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    allLabel?: string;
    placeholder?: string;
    className?: string;
}

export function MethodFilterSelect({
    value,
    onChange,
    allLabel = 'All Methods',
    placeholder = 'Method',
    className,
}: Readonly<MethodFilterSelectProps>) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className={cn('h-9 w-32 text-xs', className)}>
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">{allLabel}</SelectItem>
                {Object.values(RestfulMethod).map((method) => (
                    <SelectItem key={method} value={method}>
                        {method}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
