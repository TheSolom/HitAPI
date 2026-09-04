import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import type { Job } from 'bullmq';
import { RequestLogIngestionProcessor } from '../request-log-ingestion.processor.js';
import { AppLoggerService } from '../../../logger/logger.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import type { IngestRequestLogsJobData } from '../../types/job-data.type.js';
import type { JOBS } from '../../../../common/constants/queue.constant.js';

describe('RequestLogIngestionProcessor', () => {
    let processor: RequestLogIngestionProcessor;
    let consumersServiceMock: {
        findAllByIdentifiers: jest.Mock<any>;
        createConsumers: jest.Mock<any>;
    };
    let requestLogsServiceMock: {
        createRequestLogs: jest.Mock<any>;
    };
    let geoIPServiceMock: {
        getCountry: jest.Mock<any>;
    };
    let loggerMock: {
        setContext: jest.Mock<any>;
        debug: jest.Mock<any>;
        info: jest.Mock<any>;
        log: jest.Mock<any>;
        error: jest.Mock<any>;
    };
    let clsMock: {
        runWith: jest.Mock<any>;
        get: jest.Mock<any>;
        set: jest.Mock<any>;
    };
    let queryRunnerMock: {
        connect: jest.Mock<any>;
        startTransaction: jest.Mock<any>;
        commitTransaction: jest.Mock<any>;
        rollbackTransaction: jest.Mock<any>;
        release: jest.Mock<any>;
    };
    let dataSourceMock: {
        createQueryRunner: jest.Mock<any>;
    };

    beforeEach(async () => {
        consumersServiceMock = {
            findAllByIdentifiers: jest.fn<any>(async () => []),
            createConsumers: jest.fn<any>(async () => []),
        };
        requestLogsServiceMock = {
            createRequestLogs: jest.fn<any>(async () => {}),
        };
        geoIPServiceMock = {
            getCountry: jest.fn<any>(() => ({ countryCode: 'US' })),
        };
        loggerMock = {
            setContext: jest.fn<any>(),
            debug: jest.fn<any>(),
            info: jest.fn<any>(),
            log: jest.fn<any>(),
            error: jest.fn<any>(),
        };
        clsMock = {
            runWith: jest.fn<any>((_store: any, cb: () => any) => cb()),
            get: jest.fn<any>(),
            set: jest.fn<any>(),
        };
        queryRunnerMock = {
            connect: jest.fn<any>(async () => {}),
            startTransaction: jest.fn<any>(async () => {}),
            commitTransaction: jest.fn<any>(async () => {}),
            rollbackTransaction: jest.fn<any>(async () => {}),
            release: jest.fn<any>(async () => {}),
        };
        dataSourceMock = {
            createQueryRunner: jest.fn<any>(() => queryRunnerMock),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RequestLogIngestionProcessor,
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
                {
                    provide: DataSource,
                    useValue: dataSourceMock,
                },
                {
                    provide: Services.CONSUMERS,
                    useValue: consumersServiceMock,
                },
                {
                    provide: Services.REQUEST_LOGS,
                    useValue: requestLogsServiceMock,
                },
                {
                    provide: Services.GEO_IP,
                    useValue: geoIPServiceMock,
                },
            ],
        }).compile();

        processor = module.get<RequestLogIngestionProcessor>(
            RequestLogIngestionProcessor,
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should process request log batch with consumers and geoip, committing transaction', async () => {
        consumersServiceMock.findAllByIdentifiers.mockResolvedValue([
            { id: 10, identifier: 'cons-existing' },
        ]);
        consumersServiceMock.createConsumers.mockResolvedValue([
            { id: 11, identifier: 'cons-new' },
        ]);

        const jobMock = {
            id: 'job-req-1',
            name: 'ingest-request-logs',
            queueName: 'request-logs',
            attemptsMade: 0,
            opts: { attempts: 1 },
            data: {
                appId: 'app-uuid-1',
                fileUuid: 'file-1',
                items: [
                    {
                        uuid: 'log-uuid-1',
                        request: {
                            method: 'GET',
                            url: 'https://api.hitapi.com/v1/users',
                            path: '/v1/users',
                            size: 128,
                            headers: {},
                            clientIp: '1.2.3.4',
                            consumer: 'cons-existing',
                            timestamp: '2026-01-01T12:00:00.000Z',
                        },
                        response: {
                            statusCode: 200,
                            size: 512,
                            responseTime: 42,
                            headers: {},
                        },
                    },
                    {
                        uuid: 'log-uuid-2',
                        request: {
                            method: 'POST',
                            url: 'https://api.hitapi.com/v1/users',
                            size: 256,
                            headers: {},
                            clientIp: '5.6.7.8',
                            consumer: 'cons-new',
                            timestamp: '2026-01-01T12:00:00.000Z',
                        },
                        response: {
                            statusCode: 201,
                            size: 100,
                            responseTime: 85,
                            headers: {},
                        },
                    },
                ],
            },
        } as unknown as Job<
            IngestRequestLogsJobData,
            void,
            JOBS.INGEST_REQUEST_LOGS
        >;

        await processor.process(jobMock);

        expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
        expect(consumersServiceMock.createConsumers).toHaveBeenCalledWith(
            'app-uuid-1',
            [{ identifier: 'cons-new' }],
            queryRunnerMock,
        );
        expect(requestLogsServiceMock.createRequestLogs).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    requestUuid: 'log-uuid-1',
                    consumer: 10,
                    clientCountryCode: 'US',
                    statusCode: 200,
                    statusText: 'OK',
                }),
                expect.objectContaining({
                    requestUuid: 'log-uuid-2',
                    consumer: 11,
                    clientCountryCode: 'US',
                    path: '/v1/users',
                    statusCode: 201,
                    statusText: 'Created',
                }),
            ]),
            queryRunnerMock,
        );
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should rollback transaction and rethrow error when failure occurs', async () => {
        requestLogsServiceMock.createRequestLogs.mockRejectedValue(
            new Error('Database write error'),
        );

        const jobMock = {
            id: 'job-req-err',
            name: 'ingest-request-logs',
            queueName: 'request-logs',
            attemptsMade: 0,
            opts: { attempts: 1 },
            data: {
                appId: 'app-uuid-1',
                items: [
                    {
                        uuid: 'log-err-1',
                        request: {
                            method: 'GET',
                            url: '/test',
                            timestamp: '2026-01-01T12:00:00.000Z',
                        },
                        response: { statusCode: 500 },
                    },
                ],
            },
        } as unknown as Job<
            IngestRequestLogsJobData,
            void,
            JOBS.INGEST_REQUEST_LOGS
        >;

        await expect(processor.process(jobMock)).rejects.toThrow(
            'Database write error',
        );

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
    });
});
