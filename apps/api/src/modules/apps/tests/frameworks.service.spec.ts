/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import { FrameworksService } from '../frameworks.service.js';
import { Framework } from '../entities/framework.entity.js';
import type { CreateFrameworkDto } from '../dto/create-framework.dto.js';
import type { UpdateFrameworkDto } from '../dto/update-framework.dto.js';

const mockFrameworksRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
});

describe('FrameworksService', () => {
    let service: FrameworksService;
    let repository: jest.Mocked<Repository<Framework>>;

    const mockFramework: Framework = {
        id: 1,
        name: 'Express',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FrameworksService,
                {
                    provide: getRepositoryToken(Framework),
                    useFactory: mockFrameworksRepository,
                },
            ],
        }).compile();

        service = module.get<FrameworksService>(FrameworksService);
        repository = module.get(getRepositoryToken(Framework));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return an array of frameworks', async () => {
            const frameworks: Framework[] = [mockFramework];
            repository.find.mockResolvedValue(frameworks);

            const result = await service.findAll();

            expect(result).toEqual(frameworks);
            expect(repository.find).toHaveBeenCalled();
        });
    });

    describe('findById', () => {
        it('should return a framework by id', async () => {
            repository.findOneBy.mockResolvedValue(mockFramework);

            const result = await service.findById(1);

            expect(result).toEqual(mockFramework);
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
        });

        it('should return null if framework not found', async () => {
            repository.findOneBy.mockResolvedValue(null);

            const result = await service.findById(999);

            expect(result).toBeNull();
            expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
        });
    });

    describe('findByName', () => {
        it('should return a framework by name', async () => {
            repository.findOneBy.mockResolvedValue(mockFramework);

            const result = await service.findByName('Express');

            expect(result).toEqual(mockFramework);
            expect(repository.findOneBy).toHaveBeenCalledWith({
                name: 'Express',
            });
        });
    });

    describe('create', () => {
        it('should successfully create and return a framework', async () => {
            const dto: CreateFrameworkDto = { name: 'Fastify' };
            const created: Framework = { id: 2, name: 'Fastify' };

            repository.findOneBy.mockResolvedValue(null);
            repository.create.mockReturnValue(created);
            repository.save.mockResolvedValue(created);

            const result = await service.create(dto);

            expect(result).toEqual(created);
            expect(repository.create).toHaveBeenCalledWith({ name: 'Fastify' });
            expect(repository.save).toHaveBeenCalledWith(created);
        });

        it('should throw ConflictException if framework name already exists', async () => {
            const dto: CreateFrameworkDto = { name: 'Express' };
            repository.findOneBy.mockResolvedValue(mockFramework);

            await expect(service.create(dto)).rejects.toThrow(
                ConflictException,
            );
        });
    });

    describe('update', () => {
        it('should successfully update and return the framework', async () => {
            const dto: UpdateFrameworkDto = { name: 'Express.js' };
            const existing: Framework = { id: 1, name: 'Express' };
            const updated: Framework = { id: 1, name: 'Express.js' };

            repository.findOneBy.mockResolvedValue(existing);
            repository.findOne.mockResolvedValue(null);
            repository.save.mockResolvedValue(updated);

            const result = await service.update(1, dto);

            expect(result).toEqual(updated);
            expect(repository.save).toHaveBeenCalledWith({
                id: 1,
                name: 'Express.js',
            });
        });

        it('should throw NotFoundException if framework not found', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(
                service.update(999, { name: 'Fastify' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException if new name already exists for another framework', async () => {
            const existing: Framework = { id: 1, name: 'Express' };
            const conflicting: Framework = { id: 2, name: 'Fastify' };

            repository.findOneBy.mockResolvedValue(existing);
            repository.findOne.mockResolvedValue(conflicting);

            await expect(
                service.update(1, { name: 'Fastify' }),
            ).rejects.toThrow(ConflictException);
        });
    });

    describe('delete', () => {
        it('should successfully delete a framework', async () => {
            repository.findOneBy.mockResolvedValue(mockFramework);
            repository.remove.mockResolvedValue(mockFramework);

            await service.delete(1);

            expect(repository.remove).toHaveBeenCalledWith(mockFramework);
        });

        it('should throw NotFoundException if framework not found', async () => {
            repository.findOneBy.mockResolvedValue(null);

            await expect(service.delete(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
