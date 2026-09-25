import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { RestfulMethod } from '@hitapi/shared/enums';
import { RequestLogsController } from '../request-logs.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { GetRequestLogsOptionsDto } from '../dto/get-request-logs-options.dto.js';
import type { GetRequestLogTimelineOptionsDto } from '../dto/get-request-log-timeline-options.dto.js';
import type {
    RequestLogResponsePaginatedDto,
    RequestLogTimelineResponseDto,
    RequestLogDetailsResponseDto,
} from '../dto/index.js';

describe('RequestLogsController', () => {
    let controller: RequestLogsController;

    const mockRequestLogsService = {
        getRequestLogs: jest.fn(),
        getRequestLogsTimeline: jest.fn(),
        exportRequestLogsCsv: jest.fn(),
        getRequestLogDetails: jest.fn(),
    };

    const mockApplicationLogsService = {
        getApplicationLogs: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            controllers: [RequestLogsController],
            providers: [
                {
                    provide: Services.REQUEST_LOGS,
                    useValue: mockRequestLogsService,
                },
                {
                    provide: Services.APPLICATION_LOGS,
                    useValue: mockApplicationLogsService,
                },
            ],
        }).compile();

        controller = module.get<RequestLogsController>(RequestLogsController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getRequestLogs', () => {
        it('should return paginated request logs', async () => {
            const dto: GetRequestLogsOptionsDto = {
                appId: '123e4567-e89b-12d3-a456-426614174000',
                period: '24h',
                offset: 1,
                limit: 10,
            };

            const expectedResult: RequestLogResponsePaginatedDto = {
                data: [
                    {
                        requestUuid: 'req-1',
                        method: RestfulMethod.GET,
                        path: '/users',
                        url: 'https://api.example.com/users',
                        statusCode: 200,
                        statusText: 'OK',
                        responseTime: 120,
                        timestamp: new Date(),
                        applicationLogsCountByLevel: {},
                    },
                ],
                metadata: {
                    totalItems: 1,
                    totalPages: 1,
                    currentPage: 1,
                },
            };

            (
                mockRequestLogsService.getRequestLogs as jest.Mock<any>
            ).mockResolvedValue(expectedResult);

            const result = await controller.getRequestLogs(dto);

            expect(mockRequestLogsService.getRequestLogs).toHaveBeenCalledWith(
                dto,
            );
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getRequestLogsTimeline', () => {
        it('should return timeline data', async () => {
            const dto: GetRequestLogTimelineOptionsDto = {
                appId: '123e4567-e89b-12d3-a456-426614174000',
                period: '24h',
            };

            const expectedResult: RequestLogTimelineResponseDto = {
                timeWindows: ['2026-09-25T10:00:00.000Z'],
                itemCounts: [42],
            };

            (
                mockRequestLogsService.getRequestLogsTimeline as jest.Mock<any>
            ).mockResolvedValue(expectedResult);

            const result = await controller.getRequestLogsTimeline(dto);

            expect(
                mockRequestLogsService.getRequestLogsTimeline,
            ).toHaveBeenCalledWith(dto);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('exportRequestLogsCsv', () => {
        it('should return CSV string', async () => {
            const dto: GetRequestLogsOptionsDto = {
                appId: '123e4567-e89b-12d3-a456-426614174000',
                period: '24h',
                offset: 1,
                limit: 10,
            };

            const expectedCsv = 'requestUuid,method,path\nreq-1,GET,/users\n';
            (
                mockRequestLogsService.exportRequestLogsCsv as jest.Mock<any>
            ).mockResolvedValue(expectedCsv);

            const result = await controller.exportRequestLogsCsv(dto);

            expect(
                mockRequestLogsService.exportRequestLogsCsv,
            ).toHaveBeenCalledWith(dto);
            expect(result).toBe(expectedCsv);
        });
    });

    describe('getRequestLogDetails', () => {
        it('should return request log details', async () => {
            const requestUuid = '123e4567-e89b-12d3-a456-426614174000';
            const appId = '123e4567-e89b-12d3-a456-426614174001';
            const timestamp = '2026-09-25T10:00:00.000Z';

            const expectedResult: RequestLogDetailsResponseDto = {
                requestUuid,
                method: RestfulMethod.GET,
                path: '/users',
                url: 'https://api.example.com/users',
                statusCode: 200,
                statusText: 'OK',
                responseTime: 120,
                timestamp: new Date(),
                applicationLogsCountByLevel: {},
                requestHeaders: [['accept', 'application/json']],
                requestContentType: 'application/json',
                responseHeaders: [['content-type', 'application/json']],
                responseContentType: 'application/json',
                applicationLogsCount: 0,
            };

            (
                mockRequestLogsService.getRequestLogDetails as jest.Mock<any>
            ).mockResolvedValue(expectedResult);

            const result = await controller.getRequestLogDetails(
                requestUuid,
                appId,
                timestamp,
            );

            expect(
                mockRequestLogsService.getRequestLogDetails,
            ).toHaveBeenCalledWith(requestUuid, appId, timestamp);
            expect(result).toEqual(expectedResult);
        });
    });

    describe('getRequestLogApplicationLogs', () => {
        it('should return application logs for request', async () => {
            const requestUuid = '123e4567-e89b-12d3-a456-426614174000';
            const appId = '123e4567-e89b-12d3-a456-426614174001';

            const mockLogs = [
                {
                    message: 'User authenticated',
                    timestamp: new Date(),
                    level: 'info',
                    logger: 'auth',
                },
            ];

            (
                mockApplicationLogsService.getApplicationLogs as jest.Mock<any>
            ).mockResolvedValue(mockLogs);

            const result = await controller.getRequestLogApplicationLogs(
                requestUuid,
                appId,
            );

            expect(
                mockApplicationLogsService.getApplicationLogs,
            ).toHaveBeenCalledWith(requestUuid, appId);
            expect(result).toHaveLength(1);
            expect(result[0].message).toBe('User authenticated');
        });
    });
});
