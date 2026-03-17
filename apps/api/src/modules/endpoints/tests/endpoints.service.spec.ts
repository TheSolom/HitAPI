import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EndpointsService } from '../endpoints.service.js';
import type { IEndpointsService } from '../interfaces/endpoints-service.interface.js';
import { Endpoint } from '../entities/endpoint.entity.js';

const mockEndpointRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    merge: jest.fn(),
});

describe('EndpointsService', () => {
    let service: IEndpointsService;
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

        service = module.get<IEndpointsService>(EndpointsService);
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
            const findSpy = jest
                .spyOn(repository, 'find')
                .mockResolvedValue(expectedEndpoints);

            const result = await service.findAllByApp(appId);

            expect(result).toEqual(expectedEndpoints);
            expect(findSpy).toHaveBeenCalledWith({
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
            const findOneSpy = jest
                .spyOn(repository, 'findOne')
                .mockResolvedValue(expectedEndpoint);

            const result = await service.findOne(appId, endpointId);

            expect(result).toEqual(expectedEndpoint);
            expect(findOneSpy).toHaveBeenCalledWith({
                where: { id: endpointId, app: { id: appId } },
            });
        });

        it('should return null if endpoint not found', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            const result = await service.findOne('app-1', '1');

            expect(result).toBeNull();
        });
    });
});
