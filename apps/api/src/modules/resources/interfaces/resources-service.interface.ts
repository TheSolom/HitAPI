import type { QueryRunner } from 'typeorm';
import type { GetCpuMemoryChartOptionsDto } from '../dto/get-cpu-memory-chart-options.dto.js';
import type { CpuMemoryChartResponseDto } from '../dto/cpu-memory-chart-response.dto.js';
import type { ResourcesDto } from '../dto/resources.dto.js';

export interface IResourcesService {
    /**
     * Get CPU and memory chart data
     * @param getCpuMemoryChartOptionsDto Get CPU and memory chart options
     * @returns {Promise<CpuMemoryChartResponseDto>}
     */
    getCpuMemoryChart(
        getCpuMemoryChartOptionsDto: GetCpuMemoryChartOptionsDto,
    ): Promise<CpuMemoryChartResponseDto>;
    /**
     * Get resources metrics
     * @param appId App id
     * @returns {Promise<ResourcesDto[]>}
     */
    getResourcesMetrics(appId: string): Promise<ResourcesDto[]>;
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
