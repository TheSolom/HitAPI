import { cn } from '@/lib/utils';
import { getAvatarPalette, getInitials } from './avatar.utils';

export interface ConsumerAvatarProps {
    readonly name?: string | null;
    readonly identifier?: string;
    readonly size?: 'sm' | 'md' | 'lg';
    readonly className?: string;
}

const SIZE_CLASSES = {
    sm: 'h-8 w-8 rounded-md text-xs',
    md: 'h-9 w-9 rounded-lg text-xs font-bold shadow-2xs',
    lg: 'h-11 w-11 rounded-xl text-sm font-bold shadow-xs',
} as const;

export function ConsumerAvatar({
    name,
    identifier = '',
    size = 'md',
    className,
}: ConsumerAvatarProps) {
    const initials = getInitials(name, identifier);
    const palette = getAvatarPalette(identifier);

    return (
        <div
            className={cn(
                'flex shrink-0 items-center justify-center border font-bold',
                SIZE_CLASSES[size],
                palette.bg,
                className,
            )}
        >
            {initials}
        </div>
    );
}
