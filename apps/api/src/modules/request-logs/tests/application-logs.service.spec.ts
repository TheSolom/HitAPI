import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationLogsService } from '../application-logs.service.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { CreateApplicationLogDto } from '../dto/create-application-log.dto.js';
import type { ApplicationLog } from '../entities/application-log.entity.js';

describe('ApplicationLogsService', () => {
    let service: ApplicationLogsService;
    let applicationLogsRepositoryMock: {
        createApplicationLogs: jest.Mock<any>;
        findByRequestUuidAndAppId: jest.Mock<any>;
    };

    beforeEach(async () => {
        applicationLogsRepositoryMock = {
            createApplicationLogs: jest.fn(async () => {}),
            findByRequestUuidAndAppId: jest.fn(async () => []),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ApplicationLogsService,
                {
                    provide: Repositories.APPLICATION_LOGS,
                    useValue: applicationLogsRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<ApplicationLogsService>(ApplicationLogsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createApplicationLogs', () => {
        it('should delegate creating application logs to repository', async () => {
            const dtos: CreateApplicationLogDto[] = [
                {
                    requestUuid: 'req-1',
                    appId: 'app-1',
                    level: 'info',
                    message: 'Job processed',
                    timestamp: new Date().toISOString(),
                } as unknown as CreateApplicationLogDto,
            ];

            await service.createApplicationLogs(dtos);

            expect(
                applicationLogsRepositoryMock.createApplicationLogs,
            ).toHaveBeenCalledWith(dtos);
        });
    });

    describe('getApplicationLogs', () => {
        it('should retrieve logs by requestUuid and appId', async () => {
            const expectedLogs: ApplicationLog[] = [
                {
                    id: 1n,
                    requestUuid: 'req-1',
                    appId: 'app-1',
                    message: 'Done',
                } as unknown as ApplicationLog,
            ];
            applicationLogsRepositoryMock.findByRequestUuidAndAppId.mockResolvedValue(
                expectedLogs,
            );

            const result = await service.getApplicationLogs('req-1', 'app-1');

            expect(
                applicationLogsRepositoryMock.findByRequestUuidAndAppId,
            ).toHaveBeenCalledWith('req-1', 'app-1');
            expect(result).toEqual(expectedLogs);
        });
    });
});
