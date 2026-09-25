import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface MetricsCardsSkeletonProps {
    count?: number;
    className?: string;
}

export function MetricsCardsSkeleton({
    count = 6,
    className = 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
}: Readonly<MetricsCardsSkeletonProps>) {
    return (
        <div className={className}>
            {Array.from({ length: count }, (_, i) => i + 1).map((key) => (
                <Card key={key} className="animate-pulse">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="h-3 w-20 rounded bg-muted" />
                        <div className="h-4 w-4 rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="h-7 w-16 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
