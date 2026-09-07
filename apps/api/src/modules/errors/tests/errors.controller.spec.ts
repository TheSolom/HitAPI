import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ErrorType } from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';
import { ErrorsController } from '../errors.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { GetErrorOptionsDto } from '../dto/get-error-options.dto.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';

describe('ErrorsController', () => {
    let controller: ErrorsController;

    const mockErrorsService = {
        getErrorMetrics: jest.fn(),
        getErrorsChart: jest.fn(),
        getErrorsByConsumerChart: jest.fn(),
        getErrorRatesChart: jest.fn(),
        getErrorsTable: jest.fn(),
        getErrorDetails: jest.fn(),
    };

    const mockServerErrorsService = {
        getServerErrorsTable: jest.fn(),
    };

    const mockValidationErrorsService = {
        getValidationErrorsTable: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ErrorsController],
            providers: [
                {
                    provide: Services.ERRORS,
                    useValue: mockErrorsService,
                },
                {
                    provide: Services.SERVER_ERRORS,
                    useValue: mockServerErrorsService,
                },
                {
                    provide: Services.VALIDATION_ERRORS,
                    useValue: mockValidationErrorsService,
                },
            ],
        }).compile();

        controller = module.get<ErrorsController>(ErrorsController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getErrorsMetrics', () => {
        it('should return error metrics', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const metrics = {
                totalRequestCount: 100,
                totalErrorCount: 10,
                clientErrorCount: 8,
                serverErrorCount: 2,
                errorRate: 10,
            };
            (
                mockErrorsService.getErrorMetrics as jest.Mock<any>
            ).mockResolvedValue(metrics);

            const result = await controller.getErrorsMetrics(dto);

            expect(mockErrorsService.getErrorMetrics).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(metrics);
        });
    });

    describe('getErrorsChart', () => {
        it('should return errors chart data', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const charts = [
                {
                    errorType: ErrorType.CLIENT_ERROR,
                    timeWindows: ['2026-09-07T00:00:00.000Z'],
                    requestCounts: [5],
                    statusCodeCounts: [[[404, 5]]],
                },
            ];
            (
                mockErrorsService.getErrorsChart as jest.Mock<any>
            ).mockResolvedValue(charts);

            const result = await controller.getErrorsChart(dto);

            expect(mockErrorsService.getErrorsChart).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(charts);
        });
    });

    describe('getErrorsByConsumerChart', () => {
        it('should return errors by consumer chart', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const chart = {
                consumerIds: [1],
                consumerNames: ['Client A'],
                requestCounts: [12],
            };
            (
                mockErrorsService.getErrorsByConsumerChart as jest.Mock<any>
            ).mockResolvedValue(chart);

            const result = await controller.getErrorsByConsumerChart(dto);

            expect(
                mockErrorsService.getErrorsByConsumerChart,
            ).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(chart);
        });
    });

    describe('getErrorRatesChart', () => {
        it('should return error rates chart', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const rates = [
                {
                    errorType: ErrorType.CLIENT_ERROR,
                    timeWindows: ['2026-09-07T00:00:00.000Z'],
                    errorRates: [2.5],
                },
            ];
            (
                mockErrorsService.getErrorRatesChart as jest.Mock<any>
            ).mockResolvedValue(rates);

            const result = await controller.getErrorRatesChart(dto);

            expect(mockErrorsService.getErrorRatesChart).toHaveBeenCalledWith(
                dto,
            );
            expect(result).toMatchObject(rates);
        });
    });

    describe('getErrorsTable', () => {
        it('should return errors table data', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const table = [
                {
                    id: 'error-1',
                    method: RestfulMethod.GET,
                    path: '/api/v1/users',
                    statusCode: 404,
                    statusText: 'Not Found',
                    requestCount: 5,
                    affectedConsumers: 2,
                    expected: false,
                },
            ];
            (
                mockErrorsService.getErrorsTable as jest.Mock<any>
            ).mockResolvedValue(table);

            const result = await controller.getErrorsTable(dto);

            expect(mockErrorsService.getErrorsTable).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(table);
        });
    });

    describe('getErrorDetails', () => {
        it('should return error details', async () => {
            const dto: GetErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
            };
            const details = {
                requestCount: 15,
                affectedConsumers: 4,
                lastTimestamp: '2026-09-07T12:00:00.000Z',
            };
            (
                mockErrorsService.getErrorDetails as jest.Mock<any>
            ).mockResolvedValue(details);

            const result = await controller.getErrorDetails(dto);

            expect(mockErrorsService.getErrorDetails).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(details);
        });
    });

    describe('getValidationErrorsTable', () => {
        it('should return validation errors table data', async () => {
            const dto: GetValidationAndServerErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
                limit: 50,
            };
            const table = [
                {
                    msg: 'email must be an email',
                    type: 'value_error',
                    loc: ['body', 'email'],
                    errorCount: 8,
                },
            ];
            (
                mockValidationErrorsService.getValidationErrorsTable as jest.Mock<any>
            ).mockResolvedValue(table);

            const result = await controller.getValidationErrorsTable(dto);

            expect(
                mockValidationErrorsService.getValidationErrorsTable,
            ).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(table);
        });
    });

    describe('getServerErrorsTable', () => {
        it('should return server errors table data', async () => {
            const dto: GetValidationAndServerErrorOptionsDto = {
                appId: 'test-app-id',
                period: '24h',
                limit: 50,
            };
            const table = [
                {
                    msg: 'Connection timeout',
                    type: 'TimeoutError',
                    traceback: 'Traceback (most recent call last)...',
                    errorCount: 3,
                },
            ];
            (
                mockServerErrorsService.getServerErrorsTable as jest.Mock<any>
            ).mockResolvedValue(table);

            const result = await controller.getServerErrorsTable(dto);

            expect(
                mockServerErrorsService.getServerErrorsTable,
            ).toHaveBeenCalledWith(dto);
            expect(result).toMatchObject(table);
        });
    });
});
