import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { UpdateResult } from 'typeorm';
import { ConsumerGroupsService } from '../consumer-groups.service.js';
import { ConsumerGroup } from '../entities/consumer-group.entity.js';
import { Consumer } from '../entities/consumer.entity.js';

describe('ConsumerGroupsService', () => {
    let service: ConsumerGroupsService;

    const mockConsumerGroupRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
    };

    const mockConsumerRepository = {
        find: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConsumerGroupsService,
                {
                    provide: getRepositoryToken(ConsumerGroup),
                    useValue: mockConsumerGroupRepository,
                },
                {
                    provide: getRepositoryToken(Consumer),
                    useValue: mockConsumerRepository,
                },
            ],
        }).compile();

        service = module.get<ConsumerGroupsService>(ConsumerGroupsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAllConsumerGroups', () => {
        it('should return an array of consumer groups', async () => {
            const result = [new ConsumerGroup()];
            (
                mockConsumerGroupRepository.find as jest.Mock<any>
            ).mockResolvedValue(result);

            expect(await service.findAllConsumerGroups('app-id-1')).toBe(
                result,
            );
            expect(mockConsumerGroupRepository.find).toHaveBeenCalledWith({
                where: { app: { id: 'app-id-1' } },
                order: { name: 'ASC' },
            });
        });
    });

    describe('findConsumerGroup', () => {
        it('should return a consumer group', async () => {
            const result = new ConsumerGroup();
            (
                mockConsumerGroupRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(result);

            expect(await service.findConsumerGroup('app-id-1', 1)).toBe(result);
            expect(mockConsumerGroupRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1, app: { id: 'app-id-1' } },
                relations: { consumers: true },
            });
        });

        it('should return null if consumer group not found', async () => {
            (
                mockConsumerGroupRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            expect(await service.findConsumerGroup('app-id-1', 1)).toBeNull();
        });
    });

    describe('createConsumerGroup', () => {
        it('should create and return a consumer group', async () => {
            const dto = { name: 'test-group' };

            const group = new ConsumerGroup();
            group.id = 1;
            group.name = 'test-group';

            (
                mockConsumerGroupRepository.create as jest.Mock<any>
            ).mockReturnValue(group);
            (
                mockConsumerGroupRepository.save as jest.Mock<any>
            ).mockResolvedValue(group);

            expect(await service.createConsumerGroup('app-id-1', dto)).toBe(
                group,
            );
            expect(mockConsumerGroupRepository.create).toHaveBeenCalledWith({
                name: 'test-group',
                app: { id: 'app-id-1' },
            });
            expect(mockConsumerGroupRepository.save).toHaveBeenCalledWith(
                group,
            );
        });
    });

    describe('updateConsumerGroup', () => {
        it('should update a consumer group', async () => {
            const group = new ConsumerGroup();
            group.id = 1;
            group.name = 'old-name';
            const dto = { name: 'new-name' };

            (
                mockConsumerGroupRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(group);
            (
                mockConsumerGroupRepository.save as jest.Mock<any>
            ).mockResolvedValue({
                ...group,
                ...dto,
            });

            await service.updateConsumerGroup('app-id-1', 1, dto);

            expect(mockConsumerGroupRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'new-name',
                }),
            );
        });

        it('should throw Error if consumer group not found', async () => {
            (
                mockConsumerGroupRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            await expect(
                service.updateConsumerGroup('app-id-1', 1, {
                    name: 'test',
                }),
            ).rejects.toThrow('Consumer group not found');
        });
    });

    describe('deleteConsumerGroup', () => {
        it('should delete a consumer group', async () => {
            (
                mockConsumerGroupRepository.delete as jest.Mock<any>
            ).mockResolvedValue({ affected: 1 }) as Partial<UpdateResult>;

            await service.deleteConsumerGroup('app-id-1', 1);

            expect(mockConsumerGroupRepository.delete).toHaveBeenCalledWith({
                id: 1,
                app: { id: 'app-id-1' },
            });
        });
    });
});
