import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import type { Job } from 'bullmq';
import { SyncDataIngestionProcessor } from '../sync-data-ingestion.processor.js';
import { AppLoggerService } from '../../../logger/logger.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import type { IngestSyncDataJobData } from '../../types/job-data.type.js';
import type { JOBS } from '../../../../common/constants/queue.constant.js';

describe('SyncDataIngestionProcessor', () => {
    let processor: SyncDataIngestionProcessor;
    let consumersServiceMock: {
        findAllByIdentifiers: jest.Mock<any>;
        createConsumers: jest.Mock<any>;
        updateConsumer: jest.Mock<any>;
    };
    let consumerGroupsServiceMock: {
        findAllByNames: jest.Mock<any>;
        createManyConsumerGroups: jest.Mock<any>;
    };
    let endpointsServiceMock: {
        findAllByApp: jest.Mock<any>;
    };
    let validationErrorsServiceMock: {
        getValidationError: jest.Mock<any>;
        updateValidationErrorCount: jest.Mock<any>;
        addValidationError: jest.Mock<any>;
    };
    let serverErrorsServiceMock: {
        getServerError: jest.Mock<any>;
        updateServerErrorCount: jest.Mock<any>;
        addServerError: jest.Mock<any>;
    };
    let trafficServiceMock: {
        upsertTrafficMetrics: jest.Mock<any>;
    };
    let resourcesServiceMock: {
        upsertResource: jest.Mock<any>;
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
            updateConsumer: jest.fn<any>(async () => {}),
        };
        consumerGroupsServiceMock = {
            findAllByNames: jest.fn<any>(async () => []),
            createManyConsumerGroups: jest.fn<any>(async () => []),
        };
        endpointsServiceMock = {
            findAllByApp: jest.fn<any>(async () => []),
        };
        validationErrorsServiceMock = {
            getValidationError: jest.fn<any>(),
            updateValidationErrorCount: jest.fn<any>(async () => {}),
            addValidationError: jest.fn<any>(async () => {}),
        };
        serverErrorsServiceMock = {
            getServerError: jest.fn<any>(),
            updateServerErrorCount: jest.fn<any>(async () => {}),
            addServerError: jest.fn<any>(async () => {}),
        };
        trafficServiceMock = {
            upsertTrafficMetrics: jest.fn<any>(async () => {}),
        };
        resourcesServiceMock = {
            upsertResource: jest.fn<any>(async () => {}),
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
                SyncDataIngestionProcessor,
                { provide: AppLoggerService, useValue: loggerMock },
                { provide: ClsService, useValue: clsMock },
                { provide: DataSource, useValue: dataSourceMock },
                { provide: Services.CONSUMERS, useValue: consumersServiceMock },
                {
                    provide: Services.CONSUMER_GROUPS,
                    useValue: consumerGroupsServiceMock,
                },
                { provide: Services.ENDPOINTS, useValue: endpointsServiceMock },
                {
                    provide: Services.VALIDATION_ERRORS,
                    useValue: validationErrorsServiceMock,
                },
                {
                    provide: Services.SERVER_ERRORS,
                    useValue: serverErrorsServiceMock,
                },
                { provide: Services.TRAFFIC, useValue: trafficServiceMock },
                { provide: Services.RESOURCES, useValue: resourcesServiceMock },
            ],
        }).compile();

        processor = module.get<SyncDataIngestionProcessor>(
            SyncDataIngestionProcessor,
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should successfully process sync payload and commit transaction', async () => {
        endpointsServiceMock.findAllByApp.mockResolvedValue([
            { id: 'ep-1', method: 'GET', path: '/users' },
        ]);
        consumersServiceMock.findAllByIdentifiers.mockResolvedValue([
            { id: 101, identifier: 'c-1' },
        ]);
        validationErrorsServiceMock.getValidationError.mockResolvedValue(null);
        serverErrorsServiceMock.getServerError.mockResolvedValue({ id: 50n });

        const jobMock = {
            id: 'job-sync-1',
            name: 'ingest-sync-data',
            queueName: 'sync-data',
            attemptsMade: 0,
            opts: { attempts: 1 },
            data: {
                appId: 'app-uuid-1',
                payload: {
                    messageUuid: 'msg-1',
                    timestamp: '2026-01-01T12:00:00.000Z',
                    consumers: [
                        {
                            identifier: 'c-1',
                            name: 'Updated Name',
                        },
                    ],
                    requests: [
                        {
                            method: 'GET',
                            path: '/users',
                            requestCount: 10,
                            requestSizeSum: 100,
                            responseSizeSum: 200,
                            consumer: 'c-1',
                            responseTimes: { 10: 5, 20: 5 },
                        },
                    ],
                    serverErrors: [
                        {
                            method: 'GET',
                            path: '/users',
                            msg: 'Server down',
                            type: 'ServerError',
                            traceback: 'stack',
                            errorCount: 2,
                            consumer: 'c-1',
                        },
                    ],
                    validationErrors: [
                        {
                            method: 'GET',
                            path: '/users',
                            msg: 'Invalid id',
                            type: 'ValueError',
                            loc: ['query', 'id'],
                            errorCount: 1,
                            consumer: 'c-1',
                        },
                    ],
                    resources: {
                        cpuPercent: 12.5,
                        memoryRss: 1024000,
                    },
                },
            },
        } as unknown as Job<IngestSyncDataJobData, void, JOBS.INGEST_SYNC_DATA>;

        await processor.process(jobMock);

        expect(queryRunnerMock.startTransaction).toHaveBeenCalled();
        expect(consumersServiceMock.updateConsumer).toHaveBeenCalledWith(
            'app-uuid-1',
            101,
            expect.objectContaining({ name: 'Updated Name' }),
            queryRunnerMock,
        );
        expect(trafficServiceMock.upsertTrafficMetrics).toHaveBeenCalledWith(
            expect.objectContaining({
                endpointId: 'ep-1',
                consumerId: 101,
                requestCount: 10,
            }),
            queryRunnerMock,
        );
        expect(
            serverErrorsServiceMock.updateServerErrorCount,
        ).toHaveBeenCalledWith(50n, 2, queryRunnerMock);
        expect(
            validationErrorsServiceMock.addValidationError,
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                endpointId: 'ep-1',
                consumerId: 101,
                msg: 'Invalid id',
            }),
            queryRunnerMock,
        );
        expect(resourcesServiceMock.upsertResource).toHaveBeenCalledWith(
            'app-uuid-1',
            expect.objectContaining({
                cpuPercent: 12.5,
                memoryRss: 1024000,
            }),
            queryRunnerMock,
        );
        expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
    });

    it('should throw error when endpoint is not found in endpointMap', async () => {
        endpointsServiceMock.findAllByApp.mockResolvedValue([]);

        const jobMock = {
            id: 'job-sync-err',
            name: 'ingest-sync-data',
            queueName: 'sync-data',
            attemptsMade: 0,
            opts: { attempts: 1 },
            data: {
                appId: 'app-uuid-1',
                payload: {
                    messageUuid: 'msg-err',
                    timestamp: '2026-01-01T12:00:00.000Z',
                    consumers: [],
                    requests: [
                        {
                            method: 'GET',
                            path: '/nonexistent',
                            requestCount: 1,
                            requestSizeSum: 0,
                            responseSizeSum: 0,
                            responseTimes: {},
                        },
                    ],
                    serverErrors: [],
                    validationErrors: [],
                    resources: { cpuPercent: 0, memoryRss: 0 },
                },
            },
        } as unknown as Job<IngestSyncDataJobData, void, JOBS.INGEST_SYNC_DATA>;

        await expect(processor.process(jobMock)).rejects.toThrow(
            'Endpoint not found: GET /nonexistent',
        );

        expect(queryRunnerMock.rollbackTransaction).toHaveBeenCalled();
        expect(queryRunnerMock.release).toHaveBeenCalled();
    });
});
