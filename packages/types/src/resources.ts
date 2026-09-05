import type { Period } from './period.js';

export interface ResourceMetricsResponseDto {
    cpuPercentAvg: number;
    cpuPercentMin: number;
    cpuPercentMax: number;
    memoryRssAvg: number;
    memoryRssMin: number;
    memoryRssMax: number;
}

export interface CpuMemoryChartResponseDto {
    timeWindows: string[];
    cpuPercentAvgs: (number | null)[];
    cpuPercentMins: (number | null)[];
    cpuPercentMaxs: (number | null)[];
    memoryRssAvgs: number[];
    memoryRssMins: number[];
    memoryRssMaxs: number[];
}

export interface GetCpuMemoryChartOptions {
    appId: string;
    period?: Period;
}
