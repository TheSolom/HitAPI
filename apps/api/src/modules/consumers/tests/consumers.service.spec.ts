import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConsumersService } from '../consumers.service.js';
import type { IConsumersService } from '../interfaces/consumers-service.interface.js';
import { Consumer } from '../entities/consumer.entity.js';

describe('ConsumersService', () => {
    let consumersService: IConsumersService;

    const mockConsumerRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConsumersService,
                {
                    provide: getRepositoryToken(Consumer),
                    useValue: mockConsumerRepository,
                },
            ],
        }).compile();

        consumersService = module.get<IConsumersService>(ConsumersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(consumersService).toBeDefined();
    });

    describe('findAllByAppId', () => {
        it('should return an array of consumers', async () => {
            const result = [new Consumer()];
            (mockConsumerRepository.find as jest.Mock<any>).mockResolvedValue(
                result,
            );

            expect(await consumersService.findAllByAppId('app-id-1')).toBe(
                result,
            );
            expect(mockConsumerRepository.find).toHaveBeenCalledWith({
                where: { app: { id: 'app-id-1' }, hidden: false },
                order: { name: 'ASC' },
                relations: { group: true },
            });
        });
    });

    describe('findById', () => {
        it('should return a consumer', async () => {
            const result = new Consumer();
            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(result);

            expect(await consumersService.findById('app-id-1', 1)).toBe(result);
            expect(mockConsumerRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1, app: { id: 'app-id-1' } },
                relations: { group: true },
            });
        });

        it('should return null if consumer not found', async () => {
            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            expect(await consumersService.findById('app-id-1', 1)).toBeNull();
        });
    });

    describe('updateConsumer', () => {
        it('should update a consumer', async () => {
            const consumer = new Consumer();
            consumer.id = 1;
            consumer.name = 'old-name';
            const dto = { name: 'new-name', consumerGroupId: 2 };

            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(consumer);
            (mockConsumerRepository.save as jest.Mock<any>).mockResolvedValue(
                consumer,
            );

            await consumersService.updateConsumer('app-id-1', 1, dto);

            expect(mockConsumerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'new-name',
                    groupId: 2,
                }),
            );
        });

        it('should update consumer group to null', async () => {
            const consumer = new Consumer();
            consumer.id = 1;
            consumer.groupId = 2;
            const dto = { name: 'new-name', consumerGroupId: null };

            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(consumer);
            (mockConsumerRepository.save as jest.Mock<any>).mockResolvedValue(
                consumer,
            );

            await consumersService.updateConsumer('app-id-1', 1, dto);

            expect(mockConsumerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    groupId: null,
                }),
            );
        });

        it('should throw Error if consumer not found', async () => {
            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            await expect(
                consumersService.updateConsumer('app-id-1', 1, {
                    name: 'test',
                }),
            ).rejects.toThrow('Consumer not found');
        });
    });
});
