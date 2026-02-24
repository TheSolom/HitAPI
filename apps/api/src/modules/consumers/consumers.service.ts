import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, type QueryRunner } from 'typeorm';
import { IConsumersService } from './interfaces/consumers-service.interface.js';
import { Consumer } from './entities/consumer.entity.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IConsumerGroupsService } from './interfaces/consumer-groups-service.interface.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import type { CreateConsumerDto } from './dto/create-consumer.dto.js';
import type { UpdateConsumerDto } from './dto/update-consumer.dto.js';

@Injectable()
export class ConsumersService implements IConsumersService {
    constructor(
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
        @Inject(Services.CONSUMER_GROUPS)
        private readonly consumerGroupsService: IConsumerGroupsService,
    ) {}

    async findAllByAppId(appId: string): Promise<Consumer[]> {
        return this.consumerRepository.find({
            where: { app: { id: appId }, hidden: false },
            order: { name: 'ASC' },
            relations: { group: true },
        });
    }

    async findAllByIdentifiers(
        appId: string,
        identifiers: string[],
        queryRunner?: QueryRunner,
    ): Promise<Consumer[]> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(Consumer)
            : this.consumerRepository;

        return repository.find({
            where: { app: { id: appId }, identifier: In(identifiers) },
        });
    }

    async findById(
        appId: string,
        consumerId: number,
    ): Promise<NullableType<Consumer>> {
        return this.consumerRepository.findOne({
            where: { id: consumerId, app: { id: appId } },
            relations: { group: true },
        });
    }

    async findByIdentifier(
        appId: string,
        identifier: string,
    ): Promise<NullableType<Consumer>> {
        return this.consumerRepository.findOne({
            where: { identifier, app: { id: appId } },
        });
    }

    async createConsumers(
        appId: string,
        createConsumersDto: CreateConsumerDto[],
        queryRunner?: QueryRunner,
    ): Promise<{ id: number; identifier: string }[]> {
        const consumers = createConsumersDto.map((c) => ({
            ...c,
            app: { id: appId },
            group: { id: c.groupId },
        }));

        const repository = queryRunner
            ? queryRunner.manager.getRepository(Consumer)
            : this.consumerRepository;

        const insertResult = await repository
            .createQueryBuilder()
            .insert()
            .into(Consumer)
            .values(consumers)
            .returning(['id', 'identifier'])
            .execute();

        return insertResult.generatedMaps as {
            id: number;
            identifier: string;
        }[];
    }

    async updateConsumer(
        appId: string,
        consumerId: number,
        updateConsumerDto: UpdateConsumerDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository = queryRunner
            ? queryRunner.manager.getRepository(Consumer)
            : this.consumerRepository;

        const consumer = await repository.findOne({
            where: { id: consumerId, app: { id: appId } },
            relations: { group: true },
        });

        if (!consumer) {
            throw new Error('Consumer not found');
        }

        consumer.name = updateConsumerDto.name;

        if (updateConsumerDto.consumerGroupId !== undefined) {
            if (updateConsumerDto.consumerGroupId === null) {
                consumer.group = null;
            } else {
                const group =
                    await this.consumerGroupsService.findConsumerGroup(
                        appId,
                        updateConsumerDto.consumerGroupId,
                    );
                consumer.group = group;
            }
        }

        await repository.save(consumer);
    }
}
