import { useEffect } from 'react';
import { Cpu } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/states/EmptyState';
import { useUiStore } from '@/stores/ui-store';
import { CpuMemoryChart, ResourceMetricsCards } from '../components';

interface ResourcesPageProps {
    readonly appId?: string;
}

export function ResourcesPage({ appId }: ResourcesPageProps) {
    const activeAppId = useUiStore((s) => s.activeAppId);
    const setActiveAppId = useUiStore((s) => s.setActiveAppId);
    const period = useUiStore((s) => s.period);

    // Sync appId from search params if provided
    useEffect(() => {
        if (appId && activeAppId !== appId) {
            setActiveAppId(appId);
        }
    }, [appId, activeAppId, setActiveAppId]);

    const resolvedAppId = appId ?? activeAppId ?? '';

    const renderContent = () => {
        if (!resolvedAppId) {
            return (
                <EmptyState
                    icon={Cpu}
                    title="Select an app first"
                    description="Resource metrics are scoped to a single app. Pick an app from the app selector in the top bar."
                />
            );
        }

        return (
            <div className="space-y-6">
                {/* KPI Metrics */}
                <ResourceMetricsCards appId={resolvedAppId} />

                {/* CPU and Memory Utilization Chart */}
                <CpuMemoryChart appId={resolvedAppId} period={period} />
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Resources"
                description="CPU, memory and runtime metrics reported by the SDK."
            />
            {renderContent()}
        </div>
    );
}
