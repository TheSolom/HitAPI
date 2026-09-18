import { memo } from 'react';
import { cn } from '@/lib/utils';

export interface EndpointPathProps {
    path: string;
    className?: string;
}

export const EndpointPath = memo(function EndpointPath({
    path,
    className,
}: Readonly<EndpointPathProps>) {
    // Splits the path while preserving parameter tokens like :param, :paramId, {param}, etc.
    const parts = path.split(/(:[a-zA-Z0-9_-]+|\{[a-zA-Z0-9_-]+\})/g);

    return (
        <span
            className={cn(
                'font-mono text-xs md:text-sm font-medium text-foreground tracking-tight',
                className,
            )}
            title={path}
        >
            {parts.map((part, index) => {
                if (!part) return null;
                const isParam = /^(:[a-zA-Z0-9_-]+|\{[a-zA-Z0-9_-]+\})$/.test(
                    part,
                );
                if (isParam) {
                    return (
                        <span
                            key={index}
                            className="font-normal text-muted-foreground"
                        >
                            {part}
                        </span>
                    );
                }
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
});
