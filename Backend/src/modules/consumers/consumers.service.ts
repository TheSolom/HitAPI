import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IConsumersService } from './interfaces/consumers-service.interface.js';
import { Consumer } from './entities/consumer.entity.js';
import { Services } from '../../common/constants/services.constant.js';
import type { IConsumerGroupsService } from './interfaces/consumer-groups-service.interface.js';
import type { NullableType } from './../../common/@types/nullable.type.js';
import { UpdateConsumerDto } from './dto/update-consumer.dto.js';

@Injectable()
export class ConsumersService implements IConsumersService {
    constructor(
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
        @Inject(Services.CONSUMER_GROUPS)
        private readonly consumerGroupsService: IConsumerGroupsService,
    ) {}

    private async saveConsumer(consumer: Consumer): Promise<Consumer> {
        return this.consumerRepository.save(consumer);
    }

    async findAllConsumers(appId: string): Promise<Consumer[]> {
        return this.consumerRepository.find({
            where: { app: { id: appId }, hidden: false },
            order: { name: 'ASC' },
            relations: { group: true },
        });
    }

    async findConsumer(
        appId: string,
        consumerId: number,
    ): Promise<NullableType<Consumer>> {
        return this.consumerRepository.findOne({
            where: { id: consumerId, app: { id: appId } },
            relations: { group: true },
        });
    }

    async updateConsumer(
        appId: string,
        consumerId: number,
        updateConsumerDto: UpdateConsumerDto,
    ): Promise<void> {
        const consumer = await this.findConsumer(appId, consumerId);

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

        await this.saveConsumer(consumer);
    }
}
