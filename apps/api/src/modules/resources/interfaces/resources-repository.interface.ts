import type { QueryRunner } from 'typeorm';
import type { GetCpuMemoryChartOptionsDto } from '../dto/get-cpu-memory-chart-options.dto.js';
import type { ResourcesDto } from '../dto/resources.dto.js';

export interface ICpuMemoryChartData {
    timeWindow: Date;
    cpuPercentAvg: string | null;
    cpuPercentMin: string | null;
    cpuPercentMax: string | null;
    memoryRssAvg: string;
    memoryRssMin: string;
    memoryRssMax: string;
}

export interface IResourceMetricsData {
    cpuPercentAvg: string | null;
    cpuPercentMin: string | null;
    cpuPercentMax: string | null;
    memoryRssAvg: string | null;
    memoryRssMin: string | null;
    memoryRssMax: string | null;
}

export interface IResourcesRepository {
    /**
     * Get CPU and memory chart data
     * @param options Get CPU and memory chart options
     * @returns {Promise<ICpuMemoryChartData[]>}
     */
    getCpuMemoryChartData(
        options: GetCpuMemoryChartOptionsDto,
    ): Promise<ICpuMemoryChartData[]>;
    /**
     * Get resources metrics
     * @param appId App id
     * @returns {Promise<IResourceMetricsData>}
     */
    getResourcesMetrics(appId: string): Promise<IResourceMetricsData>;
    /**
     * Upsert resource
     * @param appId App id
     * @param resourcesDto Resources data
     * @param queryRunner Query runner
     * @returns {Promise<void>}
     */
    upsertResource(
        appId: string,
        resourcesDto: ResourcesDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
}
