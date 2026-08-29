import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function LoadingRows({
    rows = 5,
    className,
}: {
    readonly rows?: number;
    readonly className?: string;
}) {
    return (
        <output className={cn('space-y-3', className)} aria-label="Loading">
            {Array.from({ length: rows }).map((_, index) => (
                <Skeleton key={index} className="h-12 w-full" />
            ))}
        </output>
    );
}

export function LoadingCards({ count = 3 }: { readonly count?: number }) {
    return (
        <output
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            aria-label="Loading"
        >
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index}>
                    <CardHeader className="space-y-2">
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                </Card>
            ))}
        </output>
    );
}

export function LoadingForm() {
    return (
        <output className="space-y-4" aria-label="Loading">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-1/3" />
        </output>
    );
}
