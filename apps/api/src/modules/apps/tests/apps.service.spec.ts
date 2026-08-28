import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { AppsService } from '../apps.service.js';
import type { IAppsService } from '../interfaces/apps-service.interface.js';
import { App } from '../entities/app.entity.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { IRequestLogsRepository } from '../../request-logs/interfaces/request-logs-repository.interface.js';
import { CreateAppDto } from '../dto/create-app.dto.js';
import { UpdateAppDto } from '../dto/update-app.dto.js';

const mockAppRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    merge: jest.fn(),
});

const mockRequestLogsRepository = () => ({
    getAppMetrics: jest.fn<IRequestLogsRepository['getAppMetrics']>(),
});

describe('AppsService', () => {
    let service: IAppsService;
    let appRepository: Repository<App>;
    let requestLogsRepository: IRequestLogsRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AppsService,
                {
                    provide: getRepositoryToken(App),
                    useFactory: mockAppRepository,
                },
                {
                    provide: Repositories.REQUEST_LOGS,
                    useFactory: mockRequestLogsRepository,
                },
            ],
        }).compile();

        service = module.get<IAppsService>(AppsService);
        appRepository = module.get<Repository<App>>(getRepositoryToken(App));
        requestLogsRepository = module.get<IRequestLogsRepository>(
            Repositories.REQUEST_LOGS,
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllByTeam', () => {
        it('should return apps for the given team', async () => {
            const teamId = 'team-uuid-1';
            const mockApps = [
                { id: 'app-1', name: 'App 1' },
                { id: 'app-2', name: 'App 2' },
            ] as App[];

            const findSpy = jest
                .spyOn(appRepository, 'find')
                .mockResolvedValue(mockApps);

            const result = await service.findAllByTeam(teamId);

            expect(result).toEqual(mockApps);
            expect(findSpy).toHaveBeenCalledWith({
                where: { team: { id: teamId } },
                order: { createdAt: 'DESC' },
                relations: { framework: true },
            });
        });
    });

    describe('findById', () => {
        it('should return an app if found', async () => {
            const mockApp = { id: 'app-1', name: 'App 1' } as App;
            const findOneSpy = jest
                .spyOn(appRepository, 'findOne')
                .mockResolvedValue(mockApp);

            const result = await service.findById('app-1');

            expect(result).toEqual(mockApp);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: 'app-1' },
                relations: { framework: true, team: true },
            });
        });

        it('should return null if app not found', async () => {
            jest.spyOn(appRepository, 'findOne').mockResolvedValue(null);

            const result = await service.findById('non-existent');

            expect(result).toBeNull();
        });
    });

    describe('findByClientId', () => {
        it('should return an app by clientId', async () => {
            const mockApp = { id: 'app-1', clientId: 'client-123' } as App;
            const findOneSpy = jest
                .spyOn(appRepository, 'findOne')
                .mockResolvedValue(mockApp);

            const result = await service.findByClientId('client-123');

            expect(result).toEqual(mockApp);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { clientId: 'client-123' },
                relations: { framework: true },
            });
        });
    });

    describe('createApp', () => {
        it('should create an app successfully', async () => {
            const createAppDto: CreateAppDto = {
                name: 'New App',
                frameworkId: 1,
                teamId: 'team-uuid',
            };
            const createdApp = {
                id: 'app-1',
                name: createAppDto.name,
                slug: 'new-app',
                clientId: 'random-uuid',
                targetResponseTimeMs: 500,
            } as App;

            const findOneSpy = jest
                .spyOn(appRepository, 'findOne')
                .mockResolvedValue(null);
            const createSpy = jest
                .spyOn(appRepository, 'create')
                .mockReturnValue(createdApp);
            jest.spyOn(appRepository, 'save').mockResolvedValue(createdApp);

            const result = await service.createApp(createAppDto);

            expect(result).toEqual(createdApp);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { slug: 'new-app', team: { id: 'team-uuid' } },
            });
            expect(createSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New App',
                    slug: 'new-app',
                    targetResponseTimeMs: 500,
                }),
            );
        });

        it('should throw ConflictException if app with slug already exists in the same team', async () => {
            const createAppDto: CreateAppDto = {
                name: 'Existing App',
                frameworkId: 1,
                teamId: 'team-uuid',
            };
            const existingApp = { id: 'app-1', slug: 'existing-app' } as App;

            jest.spyOn(appRepository, 'findOne').mockResolvedValue(existingApp);

            await expect(service.createApp(createAppDto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('updateApp', () => {
        it('should update app successfully', async () => {
            const existingApp = {
                id: 'app-1',
                name: 'Old App',
                slug: 'old-app',
                team: { id: 'team-1' },
            } as App;
            const updateAppDto: UpdateAppDto = {
                name: 'Updated App',
                targetResponseTimeMs: 300,
            };
            const updatedApp = {
                id: 'app-1',
                name: 'Updated App',
                slug: 'updated-app',
                targetResponseTimeMs: 300,
                team: { id: 'team-1' },
            } as App;

            jest.spyOn(service, 'findById').mockResolvedValue(existingApp);
            jest.spyOn(appRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(appRepository, 'merge').mockReturnValue(updatedApp);
            jest.spyOn(appRepository, 'save').mockResolvedValue(updatedApp);

            const result = await service.updateApp('app-1', updateAppDto);

            expect(result).toEqual(updatedApp);
        });

        it('should throw ConflictException if updated name creates a slug that exists in the same team', async () => {
            const existingApp = {
                id: 'app-1',
                name: 'Old App',
                slug: 'old-app',
                team: { id: 'team-1' },
            } as App;
            const conflictingApp = {
                id: 'app-2',
                slug: 'updated-app',
                team: { id: 'team-1' },
            } as App;

            jest.spyOn(service, 'findById').mockResolvedValue(existingApp);
            jest.spyOn(appRepository, 'findOne').mockResolvedValue(
                conflictingApp,
            );

            await expect(
                service.updateApp('app-1', { name: 'Updated App' }),
            ).rejects.toThrow(ConflictException);
        });

        it('should update app active status and framework', async () => {
            const existingApp = {
                id: 'app-1',
                name: 'App',
                slug: 'app',
                active: true,
                team: { id: 'team-1' },
            } as App;
            const updateAppDto: UpdateAppDto = {
                active: false,
                frameworkId: 2,
            };
            const updatedApp = {
                id: 'app-1',
                name: 'App',
                slug: 'app',
                active: false,
                framework: { id: 2 } as App['framework'],
                team: { id: 'team-1' },
            } as App;

            jest.spyOn(service, 'findById').mockResolvedValue(existingApp);
            jest.spyOn(appRepository, 'save').mockResolvedValue(updatedApp);

            const result = await service.updateApp('app-1', updateAppDto);

            expect(result.active).toBe(false);
            expect(existingApp.active).toBe(false);
            expect(existingApp.framework).toEqual({ id: 2 });
        });

        it('should throw NotFoundException if app not found', async () => {
            jest.spyOn(service, 'findById').mockResolvedValue(null);

            await expect(
                service.updateApp('non-existent', { name: 'Test' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteApp', () => {
        it('should delete app by id', async () => {
            const deleteSpy = jest
                .spyOn(appRepository, 'delete')
                .mockResolvedValue({ raw: [], affected: 1 });

            await service.deleteApp('app-1');

            expect(deleteSpy).toHaveBeenCalledWith('app-1');
        });
    });

    describe('getAppMetrics', () => {
        it('should return app metrics correctly', async () => {
            const appId = 'app-uuid-1';
            const mockApp = {
                id: appId,
                name: 'My App',
                targetResponseTimeMs: 500,
            } as App;

            jest.spyOn(service, 'findById').mockResolvedValue(mockApp);
            const getMetricsSpy = jest
                .spyOn(requestLogsRepository, 'getAppMetrics')
                .mockResolvedValue({
                    requestCount: '100',
                    errorCount: '5',
                    satisfiedCount: '80',
                    toleratingCount: '10',
                    consumerCount: '12',
                });

            const result = await service.getAppMetrics(appId, '24h');

            expect(result).toEqual({
                requestCount: 100,
                errorRate: 5,
                apdexScore: 0.85,
                consumerCount: 12,
            });
            expect(getMetricsSpy).toHaveBeenCalledWith(appId, '24h', 500);
        });

        it('should return default zero metrics and apdex 1 when request count is 0', async () => {
            const appId = 'app-uuid-1';
            const mockApp = {
                id: appId,
                name: 'My App',
                targetResponseTimeMs: 500,
            } as App;

            jest.spyOn(service, 'findById').mockResolvedValue(mockApp);
            const getMetricsSpy = jest
                .spyOn(requestLogsRepository, 'getAppMetrics')
                .mockResolvedValue({
                    requestCount: '0',
                    errorCount: '0',
                    satisfiedCount: '0',
                    toleratingCount: '0',
                    consumerCount: '0',
                });

            const result = await service.getAppMetrics(appId, '7d');

            expect(result).toEqual({
                requestCount: 0,
                errorRate: 0,
                apdexScore: 1,
                consumerCount: 0,
            });
            expect(getMetricsSpy).toHaveBeenCalledWith(appId, '7d', 500);
        });

        it('should throw NotFoundException if app does not exist', async () => {
            jest.spyOn(service, 'findById').mockResolvedValue(null);

            await expect(
                service.getAppMetrics('non-existent-app', '24h'),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
