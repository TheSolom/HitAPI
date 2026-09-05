import type { CpuMemoryChartResponseDto } from '@hitapi/types';

export type ChartMode = 'combined' | 'cpu' | 'memory';

export interface ResourceChartDataPoint {
    timeWindow: string;
    formattedTime: string;
    cpuAvg: number | null;
    cpuMin: number | null;
    cpuMax: number | null;
    memAvgBytes: number;
    memMinBytes: number;
    memMaxBytes: number;
    memAvgMb: number;
    memMinMb: number;
    memMaxMb: number;
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

export function transformResourceChartData(
    data?: CpuMemoryChartResponseDto,
): ResourceChartDataPoint[] {
    if (!data || data.timeWindows.length === 0) {
        return [];
    }

    const mbDivisor = 1024 * 1024;

    return data.timeWindows.map((tw, idx) => {
        const cpuAvg = data.cpuPercentAvgs[idx] ?? null;
        const cpuMin = data.cpuPercentMins[idx] ?? null;
        const cpuMax = data.cpuPercentMaxs[idx] ?? null;
        const memAvgBytes = data.memoryRssAvgs[idx] ?? 0;
        const memMinBytes = data.memoryRssMins[idx] ?? 0;
        const memMaxBytes = data.memoryRssMaxs[idx] ?? 0;

        const memAvgMb = Math.round((memAvgBytes / mbDivisor) * 10) / 10;
        const memMinMb = Math.round((memMinBytes / mbDivisor) * 10) / 10;
        const memMaxMb = Math.round((memMaxBytes / mbDivisor) * 10) / 10;

        return {
            timeWindow: tw,
            formattedTime: formatTimeWindow(tw),
            cpuAvg,
            cpuMin,
            cpuMax,
            memAvgBytes,
            memMinBytes,
            memMaxBytes,
            memAvgMb,
            memMinMb,
            memMaxMb,
        };
    });
}
