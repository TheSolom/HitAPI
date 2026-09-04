import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import type { Job } from 'bullmq';
import { ApplicationLogsIngestionProcessor } from '../application-logs-ingestion.processor.js';
import { AppLoggerService } from '../../../logger/logger.service.js';
import { Services } from '../../../../common/constants/services.constant.js';
import type { IngestApplicationLogsJobData } from '../../types/job-data.type.js';
import type { JOBS } from '../../../../common/constants/queue.constant.js';

describe('ApplicationLogsIngestionProcessor', () => {
    let processor: ApplicationLogsIngestionProcessor;
    let applicationLogsServiceMock: {
        createApplicationLogs: jest.Mock<any>;
    };
    let loggerMock: {
        setContext: jest.Mock<any>;
        debug: jest.Mock<any>;
        info: jest.Mock<any>;
        error: jest.Mock<any>;
    };
    let clsMock: {
        runWith: jest.Mock<any>;
        get: jest.Mock<any>;
        set: jest.Mock<any>;
    };

    beforeEach(async () => {
        applicationLogsServiceMock = {
            createApplicationLogs: jest.fn<any>(async () => {}),
        };
        loggerMock = {
            setContext: jest.fn<any>(),
            debug: jest.fn<any>(),
            info: jest.fn<any>(),
            error: jest.fn<any>(),
        };
        clsMock = {
            runWith: jest.fn<any>((_store: any, cb: () => any) => cb()),
            get: jest.fn<any>(),
            set: jest.fn<any>(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationLogsIngestionProcessor,
                {
                    provide: Services.APPLICATION_LOGS,
                    useValue: applicationLogsServiceMock,
                },
                {
                    provide: AppLoggerService,
                    useValue: loggerMock,
                },
                {
                    provide: ClsService,
                    useValue: clsMock,
                },
            ],
        }).compile();

        processor = module.get<ApplicationLogsIngestionProcessor>(
            ApplicationLogsIngestionProcessor,
        );
    });

    it('should be defined', () => {
        expect(processor).toBeDefined();
    });

    it('should process job and insert formatted application logs', async () => {
        const jobMock = {
            id: 'job-1',
            name: 'ingest-application-logs',
            queueName: 'application-logs',
            attemptsMade: 0,
            opts: { attempts: 3 },
            data: {
                appId: 'app-uuid-1',
                fileUuid: 'file-1',
                traceId: 'trace-1',
                items: [
                    {
                        uuid: 'req-uuid-1',
                        logs: [
                            {
                                message: 'Processing started',
                                level: 'info',
                                logger: 'main',
                                timestamp: '2026-01-01T12:00:00.000Z',
                            },
                        ],
                    },
                ],
            },
        } as unknown as Job<
            IngestApplicationLogsJobData,
            void,
            JOBS.INGEST_APPLICATION_LOGS
        >;

        await processor.process(jobMock);

        expect(
            applicationLogsServiceMock.createApplicationLogs,
        ).toHaveBeenCalledWith([
            {
                requestUuid: 'req-uuid-1',
                message: 'Processing started',
                level: 'info',
                logger: 'main',
                timestamp: new Date('2026-01-01T12:00:00.000Z'),
            },
        ]);
        expect(loggerMock.info).toHaveBeenCalledWith(
            'Job completed',
            expect.any(Object),
        );
    });

    it('should skip insert when logs array is empty', async () => {
        const jobMock = {
            id: 'job-2',
            name: 'ingest-application-logs',
            queueName: 'application-logs',
            attemptsMade: 0,
            opts: { attempts: 1 },
            data: {
                appId: 'app-uuid-1',
                fileUuid: 'file-2',
                items: [
                    {
                        uuid: 'req-uuid-2',
                        logs: [],
                    },
                ],
            },
        } as unknown as Job<
            IngestApplicationLogsJobData,
            void,
            JOBS.INGEST_APPLICATION_LOGS
        >;

        await processor.process(jobMock);

        expect(
            applicationLogsServiceMock.createApplicationLogs,
        ).not.toHaveBeenCalled();
        expect(loggerMock.debug).toHaveBeenCalledWith(
            'Empty log batch, skipping insert',
        );
    });
});
