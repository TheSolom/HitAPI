import { useState } from 'react';
import { Network, Search } from 'lucide-react';
import { useUiStore } from '@/stores/ui-store';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { LoadingRows } from '@/components/states/LoadingState';
import { ErrorState } from '@/components/states/ErrorState';
import { EmptyState } from '@/components/states/EmptyState';
import { useEndpointsQuery } from '../hooks';
import { EndpointsTable } from '../components';

interface EndpointsPageProps {
    readonly appId?: string;
}

export function EndpointsPage({ appId }: EndpointsPageProps) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const resolvedAppId = appId ?? activeAppId ?? '';
    const [search, setSearch] = useState('');

    const trimmedSearch = search.trim();
    const endpointsQuery = useEndpointsQuery(
        resolvedAppId || undefined,
        trimmedSearch ? { search: trimmedSearch } : undefined,
    );

    const endpoints = endpointsQuery.data?.data ?? [];

    const renderContent = () => {
        if (!resolvedAppId) {
            return (
                <EmptyState
                    icon={Network}
                    title="Select an app first"
                    description="Endpoints are scoped to a single app. Pick an app from the app selector in the top bar."
                />
            );
        }

        if (endpointsQuery.isLoading) {
            return <LoadingRows />;
        }

        if (endpointsQuery.isError) {
            return (
                <ErrorState
                    error={endpointsQuery.error}
                    onRetry={() => {
                        void endpointsQuery.refetch();
                    }}
                />
            );
        }

        if (endpoints.length === 0) {
            return (
                <EmptyState
                    icon={Network}
                    title={
                        trimmedSearch
                            ? 'No matching endpoints'
                            : 'No endpoints discovered'
                    }
                    description={
                        trimmedSearch
                            ? 'Try refining your search keyword.'
                            : 'Endpoints appear automatically once the HitAPI SDK reports its first requests for this app.'
                    }
                />
            );
        }

        return <EndpointsTable appId={resolvedAppId} endpoints={endpoints} />;
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Endpoints"
                description="Every route discovered by the SDK. Exclude noisy routes and set per-endpoint response time targets."
            />

            {resolvedAppId ? (
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                        }}
                        placeholder="Filter endpoints by path..."
                        className="pl-9"
                        aria-label="Filter endpoints by path"
                    />
                </div>
            ) : null}

            {renderContent()}
        </div>
    );
}
