import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConsumersService } from '../consumers.service.js';
import { Consumer } from '../entities/consumer.entity.js';
import { ConsumerGroup } from '../entities/consumer-group.entity.js';
import { Services } from '../../../common/constants/services.constant.js';

describe('ConsumersService', () => {
    let consumersService: ConsumersService;

    const mockConsumerRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
    };

    const mockConsumerGroupsService = {
        findAllConsumerGroups: jest.fn(),
        findConsumerGroup: jest.fn(),
        createConsumerGroup: jest.fn(),
        updateConsumerGroup: jest.fn(),
        deleteConsumerGroup: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConsumersService,
                {
                    provide: getRepositoryToken(Consumer),
                    useValue: mockConsumerRepository,
                },
                {
                    provide: Services.CONSUMER_GROUPS,
                    useValue: mockConsumerGroupsService,
                },
            ],
        }).compile();

        consumersService = module.get<ConsumersService>(ConsumersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(consumersService).toBeDefined();
    });

    describe('findAllConsumers', () => {
        it('should return an array of consumers', async () => {
            const result = [new Consumer()];
            (mockConsumerRepository.find as jest.Mock<any>).mockResolvedValue(
                result,
            );

            expect(await consumersService.findAllConsumers('app-id-1')).toBe(
                result,
            );
            expect(mockConsumerRepository.find).toHaveBeenCalledWith({
                where: { app: { id: 'app-id-1' }, hidden: false },
                order: { name: 'ASC' },
                relations: { group: true },
            });
        });
    });

    describe('findConsumer', () => {
        it('should return a consumer', async () => {
            const result = new Consumer();
            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(result);

            expect(await consumersService.findConsumer('app-id-1', 1)).toBe(
                result,
            );
            expect(mockConsumerRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1, app: { id: 'app-id-1' } },
                relations: { group: true },
            });
        });

        it('should return null if consumer not found', async () => {
            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(null);

            expect(
                await consumersService.findConsumer('app-id-1', 1),
            ).toBeNull();
        });
    });

    describe('updateConsumer', () => {
        it('should update a consumer', async () => {
            const consumer = new Consumer();
            consumer.id = 1;
            consumer.name = 'old-name';
            const dto = { name: 'new-name', consumerGroupId: 2 };
            const group = new ConsumerGroup();
            group.id = 2;

            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(consumer);
            (
                mockConsumerGroupsService.findConsumerGroup as jest.Mock<any>
            ).mockResolvedValue(group);
            (mockConsumerRepository.save as jest.Mock<any>).mockResolvedValue({
                ...consumer,
                ...dto,
                group,
            });

            await consumersService.updateConsumer('app-id-1', 1, dto);

            expect(
                mockConsumerGroupsService.findConsumerGroup,
            ).toHaveBeenCalledWith('app-id-1', 2);
            expect(mockConsumerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'new-name',
                    group: group,
                }),
            );
        });

        it('should update consumer group to null', async () => {
            const consumer = new Consumer();
            consumer.id = 1;
            consumer.group = new ConsumerGroup();
            const dto = { name: 'new-name', consumerGroupId: null };

            (
                mockConsumerRepository.findOne as jest.Mock<any>
            ).mockResolvedValue(consumer);
            (mockConsumerRepository.save as jest.Mock<any>).mockResolvedValue({
                ...consumer,
                ...dto,
                group: null,
            });

            await consumersService.updateConsumer('app-id-1', 1, dto);

            expect(mockConsumerRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    group: null,
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
