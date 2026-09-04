import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RequestLogsService } from '../request-logs.service.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { CreateRequestLogDto } from '../dto/create-request-log.dto.js';
import type { GetRequestLogsOptionsDto } from '../dto/get-request-logs-options.dto.js';
import type { GetRequestLogTimelineOptionsDto } from '../dto/get-request-log-timeline-options.dto.js';

describe('RequestLogsService', () => {
    let service: RequestLogsService;
    let requestLogsRepositoryMock: {
        createRequestLogs: jest.Mock<any>;
        findWithFilters: jest.Mock<any>;
        findTimelineData: jest.Mock<any>;
        findByRequestUuid: jest.Mock<any>;
    };
    let applicationLogsRepositoryMock: {
        findLogCountsByRequestUuids: jest.Mock<any>;
        countByRequestUuid: jest.Mock<any>;
        findLogCountsByLevel: jest.Mock<any>;
    };

    beforeEach(async () => {
        requestLogsRepositoryMock = {
            createRequestLogs: jest.fn(async () => {}),
            findWithFilters: jest.fn(),
            findTimelineData: jest.fn(),
            findByRequestUuid: jest.fn(),
        };

        applicationLogsRepositoryMock = {
            findLogCountsByRequestUuids: jest.fn(async () => []),
            countByRequestUuid: jest.fn(async () => 0),
            findLogCountsByLevel: jest.fn(async () => []),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RequestLogsService,
                {
                    provide: Repositories.REQUEST_LOGS,
                    useValue: requestLogsRepositoryMock,
                },
                {
                    provide: Repositories.APPLICATION_LOGS,
                    useValue: applicationLogsRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<RequestLogsService>(RequestLogsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createRequestLogs', () => {
        it('should delegate creating logs to repository', async () => {
            const dtos: CreateRequestLogDto[] = [
                {
                    requestUuid: 'req-1',
                    method: 'GET',
                    path: '/test',
                    url: 'http://localhost/test',
                    statusCode: 200,
                    statusText: 'OK',
                    responseTime: 10,
                    timestamp: new Date().toISOString(),
                    requestHeaders: {},
                    responseHeaders: {},
                    appId: 'app-1',
                } as unknown as CreateRequestLogDto,
            ];

            await service.createRequestLogs(dtos);

            expect(
                requestLogsRepositoryMock.createRequestLogs,
            ).toHaveBeenCalledWith(dtos, undefined);
        });
    });

    describe('getRequestLogs', () => {
        it('should return paginated request logs with log counts by level', async () => {
            const options: GetRequestLogsOptionsDto = {
                appId: 'app-1',
                offset: 1,
                limit: 10,
                order: 'DESC',
            } as GetRequestLogsOptionsDto;

            const items = [
                {
                    requestUuid: 'uuid-1',
                    method: 'GET',
                    path: '/api/v1/test',
                    url: 'http://localhost/api/v1/test',
                    statusCode: 200,
                    statusText: 'OK',
                    responseTime: 20,
                    timestamp: new Date('2026-01-01T12:00:00.000Z'),
                    requestSize: 100,
                    responseSize: 200,
                    clientIp: '127.0.0.1',
                    clientCountryCode: 'US',
                    clientCountryName: 'United States',
                    consumerId: 1,
                    consumerIdentifier: 'c1',
                    consumerName: 'Consumer 1',
                },
            ];

            requestLogsRepositoryMock.findWithFilters.mockResolvedValue({
                items,
                totalItems: 1,
            });

            applicationLogsRepositoryMock.findLogCountsByRequestUuids.mockResolvedValue(
                [
                    {
                        requestUuid: 'uuid-1',
                        level: 'info',
                        count: 3,
                    },
                ],
            );

            const result = await service.getRequestLogs(options);

            expect(
                requestLogsRepositoryMock.findWithFilters,
            ).toHaveBeenCalledWith(
                { appId: 'app-1' },
                {
                    order: 'DESC',
                    skip: 0,
                    take: 10,
                },
            );

            expect(result.data).toHaveLength(1);
            expect(result.data[0].requestUuid).toBe('uuid-1');
            expect(result.data[0].applicationLogsCountByLevel).toEqual({
                info: 3,
            });
            expect(result.metadata).toEqual({
                currentPage: 1,
                totalPages: 1,
                totalItems: 1,
            });
        });
    });

    describe('getRequestLogsTimeline', () => {
        it('should format timeline timeWindows and counts', async () => {
            const options: GetRequestLogTimelineOptionsDto = {
                appId: 'app-1',
            } as GetRequestLogTimelineOptionsDto;

            const timeWindow = new Date('2026-01-01T12:00:00.000Z');
            requestLogsRepositoryMock.findTimelineData.mockResolvedValue([
                {
                    timeWindow,
                    itemCount: '42',
                },
            ]);

            const result = await service.getRequestLogsTimeline(options);

            expect(result).toEqual({
                timeWindows: [timeWindow.toISOString()],
                itemCounts: [42],
            });
        });
    });

    describe('exportRequestLogsCsv', () => {
        it('should return CSV string from request logs', async () => {
            const options: GetRequestLogsOptionsDto = {
                appId: 'app-1',
                offset: 1,
                limit: 10,
            } as GetRequestLogsOptionsDto;

            requestLogsRepositoryMock.findWithFilters.mockResolvedValue({
                items: [
                    {
                        requestUuid: 'uuid-1',
                        method: 'GET',
                        path: '/api/v1/test',
                        url: 'http://localhost/api/v1/test',
                        statusCode: 200,
                        statusText: 'OK',
                        responseTime: 20,
                        timestamp: new Date('2026-01-01T12:00:00.000Z'),
                        requestSize: 100,
                        responseSize: 200,
                        clientIp: '127.0.0.1',
                        clientCountryCode: 'US',
                        clientCountryName: 'United States',
                        consumerId: 1,
                        consumerIdentifier: 'c1',
                        consumerName: 'Consumer 1',
                    },
                ],
                totalItems: 1,
            });

            const csv = await service.exportRequestLogsCsv(options);

            expect(typeof csv).toBe('string');
            expect(csv).toContain('requestUuid');
            expect(csv).toContain('uuid-1');
        });
    });

    describe('getRequestLogDetails', () => {
        it('should throw NotFoundException if request log does not exist', async () => {
            requestLogsRepositoryMock.findByRequestUuid.mockResolvedValue(null);

            await expect(
                service.getRequestLogDetails('non-existent', 'app-1'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should return formatted request log details with log counts', async () => {
            const rawLog = {
                requestUuid: 'uuid-1',
                method: 'GET',
                path: '/api/v1/test',
                url: 'http://localhost/api/v1/test',
                statusCode: 200,
                statusText: 'OK',
                responseTime: 20,
                timestamp: new Date('2026-01-01T12:00:00.000Z'),
                requestSize: 100,
                responseSize: 200,
                clientIp: '127.0.0.1',
                clientCountryCode: 'US',
                clientCountryName: 'United States',
                consumerId: 1,
                consumerIdentifier: 'c1',
                consumerName: 'Consumer 1',
                requestHeaders: [['accept', 'application/json']] as [
                    string,
                    string,
                ][],
                responseHeaders: [['content-type', 'application/json']] as [
                    string,
                    string,
                ][],
                requestBody: { query: 'test' },
                responseBody: { result: 'ok' },
            };

            requestLogsRepositoryMock.findByRequestUuid.mockResolvedValue(
                rawLog,
            );
            applicationLogsRepositoryMock.countByRequestUuid.mockResolvedValue(
                5,
            );
            applicationLogsRepositoryMock.findLogCountsByLevel.mockResolvedValue(
                [
                    { level: 'error', count: 2 },
                    { level: 'info', count: 3 },
                ],
            );

            const result = await service.getRequestLogDetails(
                'uuid-1',
                'app-1',
            );

            expect(result.requestUuid).toBe('uuid-1');
            expect(result.applicationLogsCount).toBe(5);
            expect(result.applicationLogsCountByLevel).toEqual({
                error: 2,
                info: 3,
            });
        });
    });
});
