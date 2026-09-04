import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken, getFlowProducerToken } from '@nestjs/bullmq';
import { ClsService } from 'nestjs-cls';
import type {
    UserApp,
    RequestLogItem,
    StartupPayload,
    SyncPayload,
} from '@hitapi/types';
import { IngestionService } from '../ingestion.service.js';
import { AppLoggerService } from '../../logger/logger.service.js';
import {
    FLOW_PRODUCERS,
    QUEUES,
    JOBS,
} from '../../../common/constants/queue.constant.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { Endpoint } from '../../endpoints/entities/endpoint.entity.js';

describe('IngestionService', () => {
    let service: IngestionService;
    let loggerMock: {
        setContext: jest.Mock<any>;
        debug: jest.Mock<any>;
        log: jest.Mock<any>;
    };
    let clsMock: {
        get: jest.Mock<any>;
    };
    let flowProducerMock: {
        add: jest.Mock<any>;
    };
    let syncDataQueueMock: {
        add: jest.Mock<any>;
    };
    let endpointsServiceMock: {
        findAllByApp: jest.Mock<any>;
        create: jest.Mock<any>;
        restore: jest.Mock<any>;
        remove: jest.Mock<any>;
    };

    const mockApp: UserApp = {
        id: 'app-uuid-1',
        name: 'Test App',
        organizationId: 'org-1',
    } as unknown as UserApp;

    beforeEach(async () => {
        loggerMock = {
            setContext: jest.fn(),
            debug: jest.fn(),
            log: jest.fn(),
        };

        clsMock = {
            get: jest.fn((key: string) => {
                if (key === 'traceId') return 'trace-123';
                return undefined;
            }),
        };

        flowProducerMock = {
            add: jest.fn(async () => ({})),
        };

        syncDataQueueMock = {
            add: jest.fn(async () => ({})),
        };

        endpointsServiceMock = {
            findAllByApp: jest.fn(async () => []),
            create: jest.fn(async () => ({})),
            restore: jest.fn(async () => ({})),
            remove: jest.fn(async () => ({})),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngestionService,
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
                {
                    provide: getFlowProducerToken(
                        FLOW_PRODUCERS.LOGS_INGESTION,
                    ),
                    useValue: flowProducerMock,
                },
                {
                    provide: getQueueToken(QUEUES.SYNC_DATA),
                    useValue: syncDataQueueMock,
                },
                {
                    provide: Services.ENDPOINTS,
                    useValue: endpointsServiceMock,
                },
            ],
        }).compile();

        service = module.get<IngestionService>(IngestionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('ingestRequestLogs', () => {
        it('should add job tree to flow producer', async () => {
            const items: RequestLogItem[] = [
                {
                    method: 'GET',
                    path: '/api/v1/test',
                    url: 'http://localhost/api/v1/test',
                    statusCode: 200,
                    statusText: 'OK',
                    responseTime: 45,
                    timestamp: new Date().toISOString(),
                    requestHeaders: {},
                    responseHeaders: {},
                } as unknown as RequestLogItem,
            ];

            await service.ingestRequestLogs(mockApp, 'file-uuid-1', items);

            expect(flowProducerMock.add).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: JOBS.INGEST_APPLICATION_LOGS,
                    queueName: QUEUES.APPLICATION_LOGS,
                    data: {
                        appId: 'app-uuid-1',
                        fileUuid: 'file-uuid-1',
                        items,
                        traceId: 'trace-123',
                    },
                    opts: { jobId: 'file-uuid-1' },
                    children: [
                        {
                            name: JOBS.INGEST_REQUEST_LOGS,
                            queueName: QUEUES.REQUEST_LOGS,
                            data: {
                                appId: 'app-uuid-1',
                                fileUuid: 'file-uuid-1',
                                items,
                                traceId: 'trace-123',
                            },
                            opts: { jobId: 'file-uuid-1' },
                        },
                    ],
                }),
            );
        });
    });

    describe('ingestStartupData', () => {
        it('should create new endpoints, restore existing ones, and remove missing active ones', async () => {
            const existingEndpoints: Endpoint[] = [
                {
                    id: 1,
                    method: 'GET',
                    path: '/users',
                    deletedAt: null,
                } as unknown as Endpoint,
                {
                    id: 2,
                    method: 'POST',
                    path: '/users',
                    deletedAt: new Date(),
                } as unknown as Endpoint,
                {
                    id: 3,
                    method: 'DELETE',
                    path: '/users/:id',
                    deletedAt: null,
                } as unknown as Endpoint,
            ];

            endpointsServiceMock.findAllByApp.mockResolvedValue(
                existingEndpoints,
            );

            const startupPayload: StartupPayload = {
                paths: [
                    { method: 'GET', path: '/users' },
                    { method: 'POST', path: '/users' },
                    { method: 'GET', path: '/health' },
                ],
            } as unknown as StartupPayload;

            const result = await service.ingestStartupData(
                mockApp,
                startupPayload,
            );

            expect(endpointsServiceMock.restore).toHaveBeenCalledWith(
                'app-uuid-1',
                1,
            );
            expect(endpointsServiceMock.restore).toHaveBeenCalledWith(
                'app-uuid-1',
                2,
            );
            expect(endpointsServiceMock.create).toHaveBeenCalledWith(
                'app-uuid-1',
                {
                    method: 'GET',
                    path: '/health',
                },
            );
            expect(endpointsServiceMock.remove).toHaveBeenCalledWith(
                'app-uuid-1',
                3,
            );

            expect(result).toEqual({
                created: 1,
                updated: 2,
                removed: 1,
                total: 3,
            });
        });
    });

    describe('ingestSyncData', () => {
        it('should add job to sync data queue', async () => {
            const syncPayload: SyncPayload = {
                messageUuid: 'msg-uuid-123',
            } as unknown as SyncPayload;

            await service.ingestSyncData(mockApp, syncPayload);

            expect(syncDataQueueMock.add).toHaveBeenCalledWith(
                JOBS.INGEST_SYNC_DATA,
                {
                    appId: 'app-uuid-1',
                    payload: syncPayload,
                    traceId: 'trace-123',
                },
            );
        });
    });
});
