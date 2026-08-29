import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { TrafficService } from '../traffic.service.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { ITrafficService } from '../interfaces/traffic-service.interface.js';
import type { ITrafficConsumersTableRow } from '../interfaces/traffic-repository.interface.js';
import type { GetTrafficConsumersTableOptionsDto } from '../dto/get-traffic-consumers-table-options.dto.js';

describe('TrafficService', () => {
    let trafficService: ITrafficService;

    const mockTrafficMetricsRepository = {
        getTrafficMetrics: jest.fn(),
        getTrafficMetricsFiltered: jest.fn(),
        upsertTrafficMetrics: jest.fn(),
    };

    const mockErrorsRepository = {
        getErrorMetrics: jest.fn(),
        getErrorMetricsFiltered: jest.fn(),
    };

    const mockTrafficRepository = {
        getRequestsChart: jest.fn(),
        getRequestsPerMinuteChart: jest.fn(),
        getDataTransferredChart: jest.fn(),
        getRequestsByConsumerChart: jest.fn(),
        getSizeHistogram: jest.fn(),
        getTrafficEndpointsTable: jest.fn(),
        getTrafficConsumersTable: jest.fn(),
        getConsumersChart: jest.fn(),
        getStatusCodeCounts: jest.fn(),
        getTrafficData: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TrafficService,
                {
                    provide: Repositories.TRAFFIC_METRICS,
                    useValue: mockTrafficMetricsRepository,
                },
                {
                    provide: Repositories.ERRORS,
                    useValue: mockErrorsRepository,
                },
                {
                    provide: Repositories.TRAFFIC,
                    useValue: mockTrafficRepository,
                },
            ],
        }).compile();

        trafficService = module.get<ITrafficService>(TrafficService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(trafficService).toBeDefined();
    });

    describe('getTrafficConsumersTable', () => {
        it('should map and return consumers traffic table data with error rate and isNew flag', async () => {
            const now = new Date();
            const rawRows: ITrafficConsumersTableRow[] = [
                {
                    id: '1',
                    identifier: 'client-1',
                    name: 'Client Alpha',
                    groupId: '10',
                    groupName: 'Enterprise',
                    consumerCreatedAt: new Date(now.getTime() - 1000 * 60 * 60), // 1 hour ago
                    requests: '100',
                    errorCount: '5',
                    firstRequestAt: new Date(now.getTime() - 1000 * 60 * 50),
                    lastRequestAt: now,
                },
                {
                    id: '2',
                    identifier: 'client-2',
                    name: null,
                    groupId: null,
                    groupName: null,
                    consumerCreatedAt: new Date(
                        now.getTime() - 1000 * 60 * 60 * 48,
                    ), // 2 days ago
                    requests: '50',
                    errorCount: '0',
                    firstRequestAt: new Date(
                        now.getTime() - 1000 * 60 * 60 * 10,
                    ),
                    lastRequestAt: new Date(now.getTime() - 1000 * 60 * 60 * 2),
                },
            ];

            (
                mockTrafficRepository.getTrafficConsumersTable as jest.Mock<any>
            ).mockResolvedValue(rawRows);

            const options: GetTrafficConsumersTableOptionsDto = {
                appId: '1ffe3093-0742-45d0-9e9b-7cf340052806',
                period: '24h',
            };

            const result =
                await trafficService.getTrafficConsumersTable(options);

            expect(result).toHaveLength(2);

            // Client Alpha
            expect(result[0]).toEqual({
                id: 1,
                identifier: 'client-1',
                name: 'Client Alpha',
                group: {
                    id: 10,
                    name: 'Enterprise',
                },
                requests: 100,
                errorRate: 5,
                firstRequestAt: rawRows[0].firstRequestAt.toISOString(),
                lastRequestAt: rawRows[0].lastRequestAt.toISOString(),
                isNew: true,
            });

            // Client 2 (fallback to identifier for name, no group, created 2 days ago so isNew = false for 24h)
            expect(result[1]).toEqual({
                id: 2,
                identifier: 'client-2',
                name: 'client-2',
                group: undefined,
                requests: 50,
                errorRate: 0,
                firstRequestAt: rawRows[1].firstRequestAt.toISOString(),
                lastRequestAt: rawRows[1].lastRequestAt.toISOString(),
                isNew: false,
            });
        });
    });

    describe('getConsumersChart', () => {
        it('should group and format consumers chart datasets by consumer status across time windows', async () => {
            const time1 = new Date('2026-08-29T10:00:00.000Z');
            const time2 = new Date('2026-08-29T11:00:00.000Z');

            (
                mockTrafficRepository.getConsumersChart as jest.Mock<any>
            ).mockResolvedValue([
                {
                    timeWindow: time1,
                    consumerStatus: 'New',
                    count: '3',
                },
                {
                    timeWindow: time2,
                    consumerStatus: 'New',
                    count: '5',
                },
                {
                    timeWindow: time1,
                    consumerStatus: 'Existing',
                    count: '12',
                },
                {
                    timeWindow: time2,
                    consumerStatus: 'Existing',
                    count: '15',
                },
            ]);

            const result = await trafficService.getConsumersChart({
                appId: '1ffe3093-0742-45d0-9e9b-7cf340052806',
                period: '24h',
            });

            expect(result).toHaveLength(2);

            // New Dataset
            expect(result[0]).toEqual({
                consumer_status: 'New',
                timeWindows: [time1.toISOString(), time2.toISOString()],
                consumerCounts: [3, 5],
            });

            // Existing Dataset
            expect(result[1]).toEqual({
                consumer_status: 'Existing',
                timeWindows: [time1.toISOString(), time2.toISOString()],
                consumerCounts: [12, 15],
            });
        });
    });
});
