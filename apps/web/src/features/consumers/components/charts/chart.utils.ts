import type { ConsumersChartResponseDto } from '@hitapi/types';

export interface ConsumerChartEntry {
    timeWindow: string;
    formattedTime: string;
    New: number;
    Existing: number;
    Total: number;
}

export function formatTimeWindow(timeString: string): string {
    const date = new Date(timeString);
    if (Number.isNaN(date.getTime())) return timeString;

    return date.toLocaleTimeString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function transformConsumerChartData(
    datasets: readonly ConsumersChartResponseDto[] = [],
): ConsumerChartEntry[] {
    const timeMap = new Map<string, ConsumerChartEntry>();

    for (const dataset of datasets) {
        const statusKey =
            dataset.consumer_status === 'New' ? 'New' : 'Existing';
        for (let i = 0; i < dataset.timeWindows.length; i++) {
            const tw = dataset.timeWindows[i];
            const count = dataset.consumerCounts[i] ?? 0;
            if (!timeMap.has(tw)) {
                timeMap.set(tw, {
                    timeWindow: tw,
                    formattedTime: formatTimeWindow(tw),
                    New: 0,
                    Existing: 0,
                    Total: 0,
                });
            }
            const entry = timeMap.get(tw);
            if (entry) {
                entry[statusKey] = count;
                entry.Total = entry.New + entry.Existing;
            }
        }
    }

    return Array.from(timeMap.values()).sort(
        (a, b) =>
            new Date(a.timeWindow).getTime() - new Date(b.timeWindow).getTime(),
    );
}

export function calculateConsumerTotals(
    chartData: readonly ConsumerChartEntry[],
): {
    totalNew: number;
    totalExisting: number;
} {
    let n = 0;
    let e = 0;
    for (const item of chartData) {
        n += item.New;
        e += item.Existing;
    }
    return { totalNew: n, totalExisting: e };
}
