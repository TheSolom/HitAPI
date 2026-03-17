import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RestfulMethod } from '@hitapi/shared/enums';
import { EndpointConfigsService } from '../endpoint-configs.service.js';
import type { IEndpointConfigsService } from '../interfaces/endpoint-configs-service.interface.js';
import { Endpoint } from '../entities/endpoint.entity.js';
import { UpdateEndpointConfigDto } from '../dto/update-endpoint-config.dto.js';
import { UpdateEndpointErrorConfigDto } from '../dto/update-endpoint-error-config.dto.js';

const mockEndpointRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
});

describe('EndpointConfigsService', () => {
    let service: IEndpointConfigsService;
    let repository: Repository<Endpoint>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EndpointConfigsService,
                {
                    provide: getRepositoryToken(Endpoint),
                    useFactory: mockEndpointRepository,
                },
            ],
        }).compile();

        service = module.get<IEndpointConfigsService>(EndpointConfigsService);
        repository = module.get<Repository<Endpoint>>(
            getRepositoryToken(Endpoint),
        );
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getConfig', () => {
        it('should return config for existing endpoint', async () => {
            const appId = 'app-1';
            const method = 'GET' as RestfulMethod;
            const path = '/test';
            const endpoint = {
                id: '1',
                method,
                path,
                excluded: false,
                targetResponseTimeMs: 500,
            } as Endpoint;

            const findOneSpy = jest
                .spyOn(repository, 'findOne')
                .mockResolvedValue(endpoint);

            const result = await service.getConfig(appId, method, path);

            expect(result).toEqual({
                excluded: endpoint.excluded,
                targetResponseTimeMs: endpoint.targetResponseTimeMs,
            });
            expect(findOneSpy).toHaveBeenCalledWith({
                select: ['excluded', 'targetResponseTimeMs'],
                where: { app: { id: appId }, method, path },
            });
        });

        it('should throw NotFoundException if endpoint does not exist', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(
                service.getConfig('app-1', 'GET' as RestfulMethod, '/test'),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateConfig', () => {
        it('should update endpoint config', async () => {
            const appId = 'app-1';
            const dto: UpdateEndpointConfigDto = {
                method: 'GET' as RestfulMethod,
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

            const findOneSpy = jest
                .spyOn(repository, 'findOne')
                .mockResolvedValue(existingEndpoint);
            const mergeSpy = jest
                .spyOn(repository, 'merge')
                .mockReturnValue(updatedEndpoint);
            const saveSpy = jest
                .spyOn(repository, 'save')
                .mockResolvedValue(updatedEndpoint);

            await service.updateConfig(appId, dto);

            expect(findOneSpy).toHaveBeenCalled();
            expect(mergeSpy).toHaveBeenCalledWith(existingEndpoint, {
                excluded: dto.excluded,
                targetResponseTimeMs: dto.targetResponseTimeMs,
            });
            expect(saveSpy).toHaveBeenCalledWith(updatedEndpoint);
        });

        it('should throw NotFoundException if endpoint to update not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            const dto: UpdateEndpointConfigDto = {
                method: 'GET' as RestfulMethod,
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
                method: RestfulMethod.GET,
                path: '/test',
                statusCode: 400,
                expected: true,
            };
            const existingEndpoint = { id: '1' } as Endpoint;

            const findOneSpy = jest
                .spyOn(repository, 'findOne')
                .mockResolvedValue(existingEndpoint);

            await service.updateErrorConfig(appId, dto);

            expect(findOneSpy).toHaveBeenCalledWith({
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
                method: RestfulMethod.GET,
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
