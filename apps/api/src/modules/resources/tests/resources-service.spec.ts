import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import type { QueryRunner } from 'typeorm';
import { ResourcesService } from '../resources.service.js';
import type { IResourcesService } from '../interfaces/resources-service.interface.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { IResourcesRepository } from '../interfaces/resources-repository.interface.js';
import type { GetCpuMemoryChartOptionsDto } from '../dto/get-cpu-memory-chart-options.dto.js';
import type { ResourcesDto } from '../dto/resources.dto.js';
import type { Resource } from '../entities/resource.entity.js';

describe('ResourcesService', () => {
    let service: IResourcesService;
    let mockResourcesRepository: jest.Mocked<IResourcesRepository>;

    beforeEach(async () => {
        mockResourcesRepository = {
            getCpuMemoryChartData: jest.fn(),
            getResourcesMetrics: jest.fn(),
            upsertResource: jest.fn(),
        } as unknown as jest.Mocked<IResourcesRepository>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ResourcesService,
                {
                    provide: Repositories.RESOURCES,
                    useValue: mockResourcesRepository,
                },
            ],
        }).compile();

        service = module.get<IResourcesService>(ResourcesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getCpuMemoryChart', () => {
        const dto: GetCpuMemoryChartOptionsDto = {
            appId: 'test-app',
            period: '24h',
        };

        it('should return empty arrays when no data is found', async () => {
            const getCpuMemoryChartDataSpy = jest
                .spyOn(mockResourcesRepository, 'getCpuMemoryChartData')
                .mockResolvedValue([]);

            const result = await service.getCpuMemoryChart(dto);

            expect(getCpuMemoryChartDataSpy).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                timeWindows: [],
                cpuPercentAvgs: [],
                cpuPercentMins: [],
                cpuPercentMaxs: [],
                memoryRssAvgs: [],
                memoryRssMins: [],
                memoryRssMaxs: [],
            });
        });

        it('should map chart data correctly when data is returned', async () => {
            const date = new Date('2023-01-01T00:00:00Z');
            const mockData = [
                {
                    timeWindow: date,
                    cpuPercentAvg: '10.5',
                    cpuPercentMin: '5.2',
                    cpuPercentMax: '15.8',
                    memoryRssAvg: '1024',
                    memoryRssMin: '512',
                    memoryRssMax: '2048',
                },
                {
                    timeWindow: new Date('2023-01-01T01:00:00Z'),
                    cpuPercentAvg: null,
                    cpuPercentMin: null,
                    cpuPercentMax: null,
                    memoryRssAvg: '2048',
                    memoryRssMin: '1024',
                    memoryRssMax: '4096',
                },
            ];

            const getCpuMemoryChartDataSpy = jest
                .spyOn(mockResourcesRepository, 'getCpuMemoryChartData')
                .mockResolvedValue(mockData);

            const result = await service.getCpuMemoryChart(dto);

            expect(getCpuMemoryChartDataSpy).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                timeWindows: [
                    '2023-01-01T00:00:00.000Z',
                    '2023-01-01T01:00:00.000Z',
                ],
                cpuPercentAvgs: [10.5, null],
                cpuPercentMins: [5.2, null],
                cpuPercentMaxs: [15.8, null],
                memoryRssAvgs: [1024, 2048],
                memoryRssMins: [512, 1024],
                memoryRssMaxs: [2048, 4096],
            });
        });
    });

    describe('getResourcesMetrics', () => {
        it('should map resource metrics properly', async () => {
            const date = new Date();
            const mockData = [
                {
                    id: 1n,
                    cpuPercent: 12.3,
                    memoryRss: 1024,
                    timeWindow: date,
                    app: { id: 'test-app' },
                    createdAt: date,
                },
            ] as Resource[];

            const getResourcesMetricsSpy = jest
                .spyOn(mockResourcesRepository, 'getResourcesMetrics')
                .mockResolvedValue(mockData);

            const result = await service.getResourcesMetrics('test-app');

            expect(getResourcesMetricsSpy).toHaveBeenCalledWith('test-app');
            expect(result).toEqual([
                {
                    cpuPercent: 12.3,
                    memoryRss: 1024,
                    timeWindow: date,
                },
            ]);
        });
    });

    describe('upsertResource', () => {
        it('should properly call upsertResource on the repository', async () => {
            const appId = 'test-app';
            const dto: ResourcesDto = {
                cpuPercent: 5.5,
                memoryRss: 500,
                timeWindow: new Date(),
            };
            const mockQueryRunner = {} as QueryRunner;

            const upsertResourceSpy = jest
                .spyOn(mockResourcesRepository, 'upsertResource')
                .mockResolvedValue(undefined);

            await service.upsertResource(appId, dto, mockQueryRunner);

            expect(upsertResourceSpy).toHaveBeenCalledWith(
                appId,
                dto,
                mockQueryRunner,
            );
        });

        it('should pass if queryRunner is undefined', async () => {
            const appId = 'test-app';
            const dto: ResourcesDto = {
                cpuPercent: 5.5,
                memoryRss: 500,
                timeWindow: new Date(),
            };

            const upsertResourceSpy = jest
                .spyOn(mockResourcesRepository, 'upsertResource')
                .mockResolvedValue(undefined);

            await service.upsertResource(appId, dto);

            expect(upsertResourceSpy).toHaveBeenCalledWith(
                appId,
                dto,
                undefined,
            );
        });
    });
});
