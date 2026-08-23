/* eslint-disable @typescript-eslint/unbound-method */
import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';

import { NotFoundException } from '@nestjs/common';
import { FrameworksController } from '../frameworks.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IFrameworksService } from '../interfaces/frameworks-service.interface.js';
import { Framework } from '../entities/framework.entity.js';
import type { CreateFrameworkDto } from '../dto/create-framework.dto.js';
import type { UpdateFrameworkDto } from '../dto/update-framework.dto.js';

const mockFrameworksService = () => ({
    findAll: jest.fn<IFrameworksService['findAll']>(),
    findById: jest.fn<IFrameworksService['findById']>(),
    findByName: jest.fn<IFrameworksService['findByName']>(),
    create: jest.fn<IFrameworksService['create']>(),
    update: jest.fn<IFrameworksService['update']>(),
    delete: jest.fn<IFrameworksService['delete']>(),
});

describe('FrameworksController', () => {
    let controller: FrameworksController;
    let service: jest.Mocked<IFrameworksService>;

    const mockFramework: Framework = {
        id: 1,
        name: 'Express',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FrameworksController],
            providers: [
                {
                    provide: Services.FRAMEWORKS,
                    useFactory: mockFrameworksService,
                },
            ],
        }).compile();

        controller = module.get<FrameworksController>(FrameworksController);
        service = module.get(Services.FRAMEWORKS);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('listFrameworks', () => {
        it('should return an array of framework response dtos', async () => {
            service.findAll.mockResolvedValue([mockFramework]);

            const result = await controller.listFrameworks();

            expect(result).toEqual([mockFramework]);
            expect(service.findAll).toHaveBeenCalled();
        });
    });

    describe('getFramework', () => {
        it('should return framework response dto when found', async () => {
            service.findById.mockResolvedValue(mockFramework);

            const result = await controller.getFramework(1);

            expect(result).toEqual(mockFramework);
            expect(service.findById).toHaveBeenCalledWith(1);
        });

        it('should throw NotFoundException when framework not found', async () => {
            service.findById.mockResolvedValue(null);

            await expect(controller.getFramework(999)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('createFramework', () => {
        it('should create and return the new framework response dto', async () => {
            const dto: CreateFrameworkDto = { name: 'NestJS' };
            const created: Framework = { id: 2, name: 'NestJS' };
            service.create.mockResolvedValue(created);

            const result = await controller.createFramework(dto);

            expect(result).toEqual(created);
            expect(service.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('updateFramework', () => {
        it('should update and return the updated framework response dto', async () => {
            const dto: UpdateFrameworkDto = { name: 'Express.js' };
            const updated: Framework = { id: 1, name: 'Express.js' };
            service.update.mockResolvedValue(updated);

            const result = await controller.updateFramework(1, dto);

            expect(result).toEqual(updated);
            expect(service.update).toHaveBeenCalledWith(1, dto);
        });
    });

    describe('deleteFramework', () => {
        it('should call delete on service', async () => {
            service.delete.mockResolvedValue(undefined);

            await controller.deleteFramework(1);

            expect(service.delete).toHaveBeenCalledWith(1);
        });
    });
});
