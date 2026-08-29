import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConsumerStatCardProps {
    readonly title: string;
    readonly value: string | number;
    readonly description?: string;
    readonly icon?: React.ElementType;
}

export function ConsumerStatCard({
    title,
    value,
    description,
    icon: Icon,
}: ConsumerStatCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon ? (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                ) : null}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold tabular-nums">{value}</div>
                {description ? (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                ) : null}
            </CardContent>
        </Card>
    );
}
