import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { EndpointsService } from '../endpoints.service.js';
import { Endpoint } from '../entities/endpoint.entity.js';
import { UpdateEndpointConfigDto } from '../dto/update-endpoint-config.dto.js';
import { UpdateEndpointErrorConfigDto } from '../dto/update-endpoint-error-config.dto.js';

const mockEndpointRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
});

describe('EndpointsService', () => {
    let service: EndpointsService;
    let repository: Repository<Endpoint>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EndpointsService,
                {
                    provide: getRepositoryToken(Endpoint),
                    useFactory: mockEndpointRepository,
                },
            ],
        }).compile();

        service = module.get<EndpointsService>(EndpointsService);
        repository = module.get<Repository<Endpoint>>(
            getRepositoryToken(Endpoint),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllByApp', () => {
        it('should return an array of endpoints', async () => {
            const appId = 'app-1';
            const expectedEndpoints = [
                { id: '1', method: 'GET', path: '/test' },
            ] as Endpoint[];
            jest.spyOn(repository, 'find').mockResolvedValue(expectedEndpoints);

            const result = await service.findAllByApp(appId);

            expect(result).toEqual(expectedEndpoints);
            expect(repository.find).toHaveBeenCalledWith({
                where: { app: { id: appId } },
                order: { path: 'ASC', method: 'ASC' },
            });
        });
    });

    describe('findOne', () => {
        it('should return a single endpoint by id', async () => {
            const appId = 'app-1';
            const endpointId = '1';
            const expectedEndpoint = {
                id: endpointId,
                method: 'GET',
                path: '/test',
            } as Endpoint;
            jest.spyOn(repository, 'findOne').mockResolvedValue(
                expectedEndpoint,
            );

            const result = await service.findOne(appId, endpointId);

            expect(result).toEqual(expectedEndpoint);
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: endpointId, app: { id: appId } },
            });
        });

        it('should return null if endpoint not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            const result = await service.findOne('app-1', '1');

            expect(result).toBeNull();
        });
    });

    describe('getConfig', () => {
        it('should return config for existing endpoint', async () => {
            const appId = 'app-1';
            const method = 'GET';
            const path = '/test';
            const endpoint = {
                id: '1',
                method,
                path,
                excluded: false,
                targetResponseTimeMs: 500,
            } as Endpoint;

            jest.spyOn(repository, 'findOne').mockResolvedValue(endpoint);

            const result = await service.getConfig(appId, method, path);

            expect(result).toEqual({
                excluded: endpoint.excluded,
                targetResponseTimeMs: endpoint.targetResponseTimeMs,
            });
            expect(repository.findOne).toHaveBeenCalledWith({
                where: { app: { id: appId }, method, path },
            });
        });

        it('should throw NotFoundException if endpoint does not exist', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(
                service.getConfig('app-1', 'GET', '/test'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateConfig', () => {
        it('should update endpoint config', async () => {
            const appId = 'app-1';
            const dto: UpdateEndpointConfigDto = {
                method: 'GET',
                path: '/test',
                excluded: true,
                targetResponseTimeMs: 1000,
            };
            const existingEndpoint = {
                id: '1',
                method: 'GET',
                path: '/test',
                excluded: false,
                targetResponseTimeMs: 500,
            } as Endpoint;
            const updatedEndpoint = {
                ...existingEndpoint,
                ...dto,
            } as unknown as Endpoint;

            jest.spyOn(repository, 'findOne').mockResolvedValue(
                existingEndpoint,
            );
            jest.spyOn(repository, 'merge').mockReturnValue(updatedEndpoint);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedEndpoint);

            await service.updateConfig(appId, dto);

            expect(repository.findOne).toHaveBeenCalled();
            expect(repository.merge).toHaveBeenCalledWith(existingEndpoint, {
                excluded: dto.excluded,
                targetResponseTimeMs: dto.targetResponseTimeMs,
            });
            expect(repository.save).toHaveBeenCalledWith(updatedEndpoint);
        });

        it('should throw NotFoundException if endpoint to update not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            const dto: UpdateEndpointConfigDto = {
                method: 'GET',
                path: '/test',
            };

            await expect(service.updateConfig('app-1', dto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('updateErrorConfig', () => {
        it('should successfully update error config (check existence)', async () => {
            const appId = 'app-1';
            const dto: UpdateEndpointErrorConfigDto = {
                method: 'GET',
                path: '/test',
                statusCode: 400,
                expected: true,
            };
            const existingEndpoint = { id: '1' } as Endpoint;

            jest.spyOn(repository, 'findOne').mockResolvedValue(
                existingEndpoint,
            );

            await service.updateErrorConfig(appId, dto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: {
                    app: { id: appId },
                    method: dto.method,
                    path: dto.path,
                },
            });
        });

        it('should throw NotFoundException if endpoint not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            const dto: UpdateEndpointErrorConfigDto = {
                method: 'GET',
                path: '/test',
                statusCode: 400,
                expected: true,
            };

            await expect(
                service.updateErrorConfig('app-1', dto),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
