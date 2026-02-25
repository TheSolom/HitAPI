import { Inject, Injectable } from '@nestjs/common';
import type { QueryRunner } from 'typeorm';
import type { IResourcesService } from './interfaces/resources-service.interface.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { IResourcesRepository } from './interfaces/resources-repository.interface.js';
import type { GetCpuMemoryChartOptionsDto } from './dto/get-cpu-memory-chart-options.dto.js';
import type { CpuMemoryChartResponseDto } from './dto/cpu-memory-chart-response.dto.js';
import type { ResourcesDto } from './dto/resources.dto.js';

@Injectable()
export class ResourcesService implements IResourcesService {
    constructor(
        @Inject(Repositories.RESOURCES)
        private readonly resourcesRepository: IResourcesRepository,
    ) {}

    async getCpuMemoryChart(
        getCpuMemoryChartOptionsDto: GetCpuMemoryChartOptionsDto,
    ): Promise<CpuMemoryChartResponseDto> {
        const data = await this.resourcesRepository.getCpuMemoryChartData(
            getCpuMemoryChartOptionsDto,
        );

        if (data.length === 0) {
            return {
                timeWindows: [],
                cpuPercentAvgs: [],
                cpuPercentMins: [],
                cpuPercentMaxs: [],
                memoryRssAvgs: [],
                memoryRssMins: [],
                memoryRssMaxs: [],
            };
        }

        return {
            timeWindows: data.map((d) => d.timeWindow.toISOString()),
            cpuPercentAvgs: data.map((d) =>
                d.cpuPercentAvg ? Number.parseFloat(d.cpuPercentAvg) : null,
            ),
            cpuPercentMins: data.map((d) =>
                d.cpuPercentMin ? Number.parseFloat(d.cpuPercentMin) : null,
            ),
            cpuPercentMaxs: data.map((d) =>
                d.cpuPercentMax ? Number.parseFloat(d.cpuPercentMax) : null,
            ),
            memoryRssAvgs: data.map((d) => Number.parseInt(d.memoryRssAvg)),
            memoryRssMins: data.map((d) => Number.parseInt(d.memoryRssMin)),
            memoryRssMaxs: data.map((d) => Number.parseInt(d.memoryRssMax)),
        };
    }

    async getResourcesMetrics(appId: string): Promise<ResourcesDto[]> {
        const resources =
            await this.resourcesRepository.getResourcesMetrics(appId);

        return resources.map((resource) => ({
            cpuPercent: resource.cpuPercent,
            memoryRss: resource.memoryRss,
            timeWindow: resource.timeWindow,
        }));
    }

    async upsertResource(
        appId: string,
        resourcesDto: ResourcesDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        await this.resourcesRepository.upsertResource(
            appId,
            resourcesDto,
            queryRunner,
        );
    }
}
