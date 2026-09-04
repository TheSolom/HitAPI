import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorsService } from '../errors.service.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import { ErrorType } from '../enums/error-type.enum.js';
import type { GetErrorOptionsDto } from '../dto/get-error-options.dto.js';

describe('ErrorsService', () => {
    let service: ErrorsService;
    let errorsRepositoryMock: {
        getErrorMetricsFiltered: jest.Mock<any>;
        getErrorMetrics: jest.Mock<any>;
        getErrorsChart: jest.Mock<any>;
        getErrorsByConsumerChart: jest.Mock<any>;
        getErrorRatesChart: jest.Mock<any>;
        getErrorsTable: jest.Mock<any>;
        getErrorDetails: jest.Mock<any>;
    };
    let trafficMetricsRepositoryMock: {
        getTotalRequests: jest.Mock<any>;
    };
    let endpointConfigsServiceMock: {
        getExpectedStatusCodes: jest.Mock<any>;
    };

    beforeEach(async () => {
        errorsRepositoryMock = {
            getErrorMetricsFiltered: jest.fn(),
            getErrorMetrics: jest.fn(),
            getErrorsChart: jest.fn(),
            getErrorsByConsumerChart: jest.fn(),
            getErrorRatesChart: jest.fn(),
            getErrorsTable: jest.fn(),
            getErrorDetails: jest.fn(),
        };

        trafficMetricsRepositoryMock = {
            getTotalRequests: jest.fn(),
        };

        endpointConfigsServiceMock = {
            getExpectedStatusCodes: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ErrorsService,
                {
                    provide: Repositories.ERRORS,
                    useValue: errorsRepositoryMock,
                },
                {
                    provide: Repositories.TRAFFIC_METRICS,
                    useValue: trafficMetricsRepositoryMock,
                },
                {
                    provide: Services.ENDPOINT_CONFIGS,
                    useValue: endpointConfigsServiceMock,
                },
            ],
        }).compile();

        service = module.get<ErrorsService>(ErrorsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getErrorMetrics', () => {
        it('should return metrics for unfiltered request', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;

            errorsRepositoryMock.getErrorMetrics.mockResolvedValue({
                totalErrorCount: '10',
                clientErrorCount: '6',
                serverErrorCount: '4',
            });
            trafficMetricsRepositoryMock.getTotalRequests.mockResolvedValue(
                100,
            );

            const result = await service.getErrorMetrics(dto);

            expect(errorsRepositoryMock.getErrorMetrics).toHaveBeenCalledWith(
                dto,
            );
            expect(
                trafficMetricsRepositoryMock.getTotalRequests,
            ).toHaveBeenCalledWith(dto);
            expect(result).toEqual({
                totalRequestCount: 100,
                totalErrorCount: 10,
                clientErrorCount: 6,
                serverErrorCount: 4,
                errorRate: 10,
            });
        });

        it('should return metrics for filtered request', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
                period: '24h',
                statusCode: '500',
            };

            errorsRepositoryMock.getErrorMetricsFiltered.mockResolvedValue({
                totalRequestCount: '50',
                totalErrorCount: '5',
                clientErrorCount: '0',
                serverErrorCount: '5',
            });

            const result = await service.getErrorMetrics(dto);

            expect(
                errorsRepositoryMock.getErrorMetricsFiltered,
            ).toHaveBeenCalledWith(dto);
            expect(
                trafficMetricsRepositoryMock.getTotalRequests,
            ).not.toHaveBeenCalled();
            expect(result).toEqual({
                totalRequestCount: 50,
                totalErrorCount: 5,
                clientErrorCount: 0,
                serverErrorCount: 5,
                errorRate: 10,
            });
        });
    });

    describe('getErrorsChart', () => {
        it('should format client and server error chart items correctly', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;
            const now = new Date('2026-01-01T12:00:00.000Z');

            errorsRepositoryMock.getErrorsChart.mockResolvedValue({
                clientErrors: [
                    {
                        timeWindow: now,
                        statusCode: '400',
                        requestCount: '15',
                    },
                ],
                serverErrors: [
                    {
                        timeWindow: now,
                        statusCode: '500',
                        requestCount: '5',
                    },
                ],
            });

            const result = await service.getErrorsChart(dto);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                errorType: ErrorType.CLIENT_ERROR,
                timeWindows: [now.toISOString()],
                requestCounts: [15],
                statusCodeCounts: [[[400, 15]]],
            });
            expect(result[1]).toEqual({
                errorType: ErrorType.SERVER_ERROR,
                timeWindows: [now.toISOString()],
                requestCounts: [5],
                statusCodeCounts: [[[500, 5]]],
            });
        });
    });

    describe('getErrorsByConsumerChart', () => {
        it('should map consumer errors chart data', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;

            errorsRepositoryMock.getErrorsByConsumerChart.mockResolvedValue([
                {
                    consumerId: '1',
                    consumerName: 'Consumer A',
                    requestCount: '25',
                },
                {
                    consumerId: '2',
                    consumerName: 'Consumer B',
                    requestCount: '10',
                },
            ]);

            const result = await service.getErrorsByConsumerChart(dto);

            expect(result).toEqual({
                consumerIds: [1, 2],
                consumerNames: ['Consumer A', 'Consumer B'],
                requestCounts: [25, 10],
            });
        });
    });

    describe('getErrorRatesChart', () => {
        it('should calculate error rates per time window', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;
            const time1 = new Date('2026-01-01T12:00:00.000Z');
            const totals = new Map<string, number>([
                [time1.toISOString(), 100],
            ]);

            errorsRepositoryMock.getErrorRatesChart.mockResolvedValue({
                totals,
                clientErrors: [
                    {
                        timeWindow: time1,
                        errorCount: '5',
                    },
                ],
                serverErrors: [
                    {
                        timeWindow: time1,
                        errorCount: '2',
                    },
                ],
            });

            const result = await service.getErrorRatesChart(dto);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                errorType: ErrorType.CLIENT_ERROR,
                timeWindows: [time1.toISOString()],
                errorRates: [5],
            });
            expect(result[1]).toEqual({
                errorType: ErrorType.SERVER_ERROR,
                timeWindows: [time1.toISOString()],
                errorRates: [2],
            });
        });
    });

    describe('getErrorsTable', () => {
        it('should return errors table with expected status flags', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;

            errorsRepositoryMock.getErrorsTable.mockResolvedValue([
                {
                    id: 1,
                    method: 'GET',
                    path: '/users',
                    statusCode: '404',
                    requestCount: '12',
                    affectedConsumers: '3',
                },
            ]);

            endpointConfigsServiceMock.getExpectedStatusCodes.mockResolvedValue(
                [404],
            );

            const result = await service.getErrorsTable(dto);

            expect(result).toEqual([
                {
                    id: 1,
                    method: 'GET',
                    path: '/users',
                    statusCode: 404,
                    statusText: 'Not Found',
                    requestCount: 12,
                    affectedConsumers: 3,
                    expected: true,
                },
            ]);
        });
    });

    describe('getErrorDetails', () => {
        it('should return error details with parsed counts and timestamp', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;
            const lastTimestamp = new Date('2026-01-01T15:30:00.000Z');

            errorsRepositoryMock.getErrorDetails.mockResolvedValue({
                requestCount: '42',
                affectedConsumers: '7',
                lastTimestamp,
            });

            const result = await service.getErrorDetails(dto);

            expect(result).toEqual({
                requestCount: 42,
                affectedConsumers: 7,
                lastTimestamp: lastTimestamp.toISOString(),
            });
        });

        it('should handle undefined repository response with defaults', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetErrorOptionsDto;
            errorsRepositoryMock.getErrorDetails.mockResolvedValue(undefined);

            const result = await service.getErrorDetails(dto);

            expect(result.requestCount).toBe(0);
            expect(result.affectedConsumers).toBe(0);
            expect(result.lastTimestamp).toBeDefined();
        });
    });
});
