import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    type ObjectLiteral,
    type SelectQueryBuilder,
    type QueryRunner,
} from 'typeorm';
import type {
    IResourcesRepository,
    ICpuMemoryChartData,
} from '../interfaces/resources-repository.interface.js';
import { Resource } from '../entities/resource.entity.js';
import type { GetCpuMemoryChartOptionsDto } from '../dto/get-cpu-memory-chart-options.dto.js';
import type { ResourcesDto } from '../dto/resources.dto.js';
import { parsePeriod } from '../../../common/utils/period.util.js';
import type { ParsedPeriod } from '../../../common/types/period.type.js';

@Injectable()
export class ResourcesRepository implements IResourcesRepository {
    constructor(
        @InjectRepository(Resource)
        private readonly resourcesRepository: Repository<Resource>,
    ) {}

    private applyPeriodFilter<T extends ObjectLiteral>(
        qb: SelectQueryBuilder<T>,
        period: ParsedPeriod,
    ): void {
        if (!period) return;

        if (period.type === 'relative') {
            qb.andWhere('r.timeWindow >= :periodTimestamp', {
                periodTimestamp: period.since.toISOString(),
            });
        } else {
            qb.andWhere('r.timeWindow BETWEEN :startDate AND :endDate', {
                startDate: period.startDate.toISOString(),
                endDate: period.endDate.toISOString(),
            });
        }
    }

    async getCpuMemoryChartData({
        appId,
        period,
    }: GetCpuMemoryChartOptionsDto): Promise<ICpuMemoryChartData[]> {
        const qb = this.resourcesRepository
            .createQueryBuilder('r')
            .select('r.timeWindow', '"timeWindow"')
            .addSelect('AVG(r.cpuPercent)', '"cpuPercentAvg"')
            .addSelect('MIN(r.cpuPercent)', '"cpuPercentMin"')
            .addSelect('MAX(r.cpuPercent)', '"cpuPercentMax"')
            .addSelect('AVG(r.memoryRss)', '"memoryRssAvg"')
            .addSelect('MIN(r.memoryRss)', '"memoryRssMin"')
            .addSelect('MAX(r.memoryRss)', '"memoryRssMax"')
            .where({ app: { id: appId } })
            .groupBy('r.timeWindow')
            .orderBy('r.timeWindow', 'ASC');

        this.applyPeriodFilter<Resource>(qb, parsePeriod(period));

        return qb.getRawMany<ICpuMemoryChartData>();
    }

    async getResourcesMetrics(appId: string): Promise<Resource[]> {
        return this.resourcesRepository.find({
            where: { app: { id: appId } },
            order: { timeWindow: 'DESC' },
        });
    }

    async upsertResource(
        appId: string,
        resourcesDto: ResourcesDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(Resource) ??
            this.resourcesRepository;

        await repository.upsert(
            {
                ...resourcesDto,
                app: { id: appId },
            },
            {
                conflictPaths: ['app', 'timeWindow'],
                skipUpdateIfNoValuesChanged: true,
            },
        );
    }
}
