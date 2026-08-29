import { Construction } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/states/EmptyState';

interface ComingSoonProps {
    title: string;
    description: string;
    phase: string;
}

export function ComingSoon({
    title,
    description,
    phase,
}: Readonly<ComingSoonProps>) {
    return (
        <div>
            <PageHeader title={title} description={description} />
            <EmptyState
                icon={Construction}
                title={`${title} is coming soon`}
                description={`This screen is scaffolded as part of ${phase}. The route, navigation entry and layout are in place so the feature can be built out without restructuring anything.`}
            />
        </div>
    );
}
