import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AppsController } from '../apps.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IAppsService } from '../interfaces/apps-service.interface.js';
import { CreateAppDto } from '../dto/create-app.dto.js';
import { UpdateAppDto } from '../dto/update-app.dto.js';
import { App } from '../entities/app.entity.js';
import { Framework } from '../entities/framework.entity.js';
import { Team } from '../../teams/entities/team.entity.js';

const mockAppsService = () => ({
    findAllByTeam: jest.fn<IAppsService['findAllByTeam']>(),
    findById: jest.fn<IAppsService['findById']>(),
    findByClientId: jest.fn<IAppsService['findByClientId']>(),
    createApp: jest.fn<IAppsService['createApp']>(),
    updateApp: jest.fn<IAppsService['updateApp']>(),
    deleteApp: jest.fn<IAppsService['deleteApp']>(),
    getAppMetrics: jest.fn<IAppsService['getAppMetrics']>(),
});

describe('AppsController', () => {
    let controller: AppsController;
    let service: IAppsService;

    const mockFramework: Framework = {
        id: 1,
        name: 'Express',
    };

    const mockApp: App = {
        id: 'app-uuid-1',
        name: 'Test App',
        slug: 'test-app',
        clientId: 'client-uuid-1',
        targetResponseTimeMs: 500,
        active: true,
        framework: mockFramework,
        team: new Team(),
        endpoints: [],
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AppsController],
            providers: [
                {
                    provide: Services.APPS,
                    useFactory: mockAppsService,
                },
            ],
        }).compile();

        controller = module.get<AppsController>(AppsController);
        service = module.get<IAppsService>(Services.APPS);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('listApps', () => {
        it('should return an array of apps for a team', async () => {
            const teamId = 'team-uuid-1';
            const findSpy = jest
                .spyOn(service, 'findAllByTeam')
                .mockResolvedValue([mockApp]);

            const result = await controller.listApps(teamId);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(mockApp.id);
            expect(findSpy).toHaveBeenCalledWith(teamId);
        });
    });

    describe('createApp', () => {
        it('should create and return the app', async () => {
            const createAppDto: CreateAppDto = {
                name: 'Test App',
                frameworkId: 1,
                teamId: 'team-uuid-1',
            };

            const createSpy = jest
                .spyOn(service, 'createApp')
                .mockResolvedValue(mockApp);

            const result = await controller.createApp(createAppDto);

            expect(result.id).toBe(mockApp.id);
            expect(createSpy).toHaveBeenCalledWith(createAppDto);
        });
    });

    describe('getApp', () => {
        it('should return an app when found', async () => {
            const findSpy = jest
                .spyOn(service, 'findById')
                .mockResolvedValue(mockApp);

            const result = await controller.getApp(mockApp.id);

            expect(result.id).toBe(mockApp.id);
            expect(findSpy).toHaveBeenCalledWith(mockApp.id);
        });

        it('should throw NotFoundException when app not found', async () => {
            jest.spyOn(service, 'findById').mockResolvedValue(null);

            await expect(controller.getApp('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateApp', () => {
        it('should update and return the app', async () => {
            const updateAppDto: UpdateAppDto = {
                name: 'Updated App Name',
            };

            const updatedApp = new App();
            Object.assign(updatedApp, mockApp, { name: 'Updated App Name' });

            const updateSpy = jest
                .spyOn(service, 'updateApp')
                .mockResolvedValue(updatedApp);

            const result = await controller.updateApp(updateAppDto, mockApp.id);

            expect(result.name).toBe('Updated App Name');
            expect(updateSpy).toHaveBeenCalledWith(mockApp.id, updateAppDto);
        });
    });

    describe('deleteApp', () => {
        it('should call service deleteApp', async () => {
            const deleteSpy = jest
                .spyOn(service, 'deleteApp')
                .mockResolvedValue(undefined);

            await controller.deleteApp(mockApp.id);

            expect(deleteSpy).toHaveBeenCalledWith(mockApp.id);
        });
    });

    describe('getAppMetrics', () => {
        it('should return app metrics', async () => {
            const expectedMetrics = {
                requestCount: 150,
                errorRate: 2.5,
                apdexScore: 0.95,
                consumerCount: 8,
            };

            const metricsSpy = jest
                .spyOn(service, 'getAppMetrics')
                .mockResolvedValue(expectedMetrics);

            const result = await controller.getAppMetrics(mockApp.id, {
                period: '24h',
            });

            expect(result).toEqual(expectedMetrics);
            expect(metricsSpy).toHaveBeenCalledWith(mockApp.id, '24h');
        });
    });
});
