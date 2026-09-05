import { Outlet, useParams, useSearch } from '@tanstack/react-router';
import { ComingSoon } from '@/components/states/ComingSoon';
import { TeamDetailPage } from '@/features/teams/pages/TeamDetailPage';
import { AppDetailPage } from '@/features/apps/pages/AppDetailPage';
import { ConsumerDetailPage, ConsumersPage } from '@/features/consumers';
import { EndpointsPage } from '@/features/endpoints';
import { ResourcesPage } from '@/features/resources';

export function RootComponent() {
    return <Outlet />;
}

export function IndexComponent() {
    return null;
}

export function TeamDetailRouteComponent() {
    const { teamId } = useParams({ from: '/protected/teams/$teamId' });
    return <TeamDetailPage teamId={teamId} />;
}

export function AppDetailRouteComponent() {
    const { appId } = useParams({ from: '/protected/apps/$appId' });
    return <AppDetailPage appId={appId} />;
}

export function ConsumersRouteComponent() {
    const { appId, groupId, tab } = useSearch({ from: '/protected/consumers' });
    return (
        <ConsumersPage
            appId={appId}
            initialGroupId={groupId}
            initialTab={tab}
        />
    );
}

export function ConsumerDetailRouteComponent() {
    const { consumerId } = useParams({
        from: '/protected/consumers/$consumerId',
    });
    return <ConsumerDetailPage consumerId={Number.parseInt(consumerId, 10)} />;
}

export function EndpointsRouteComponent() {
    const { appId } = useSearch({ from: '/protected/endpoints' });
    return <EndpointsPage appId={appId} />;
}

export function ResourcesRouteComponent() {
    const { appId } = useSearch({ from: '/protected/resources' });
    return <ResourcesPage appId={appId} />;
}

export interface PlaceholderRouteComponentProps {
    readonly title: string;
    readonly description: string;
    readonly phase: string;
}

export function PlaceholderRouteComponent({
    title,
    description,
    phase,
}: PlaceholderRouteComponentProps) {
    return <ComingSoon title={title} description={description} phase={phase} />;
}
