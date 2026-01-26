import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { IConsumerGroupsService } from './interfaces/consumer-groups-service.interface.js';
import { ConsumerGroup } from './entities/consumer-group.entity.js';
import { Consumer } from './entities/consumer.entity.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { CreateConsumerGroupDto } from './dto/create-consumer-group.dto.js';
import { UpdateConsumerGroupDto } from './dto/update-consumer-group.dto.js';

@Injectable()
export class ConsumerGroupsService implements IConsumerGroupsService {
    constructor(
        @InjectRepository(ConsumerGroup)
        private readonly consumerGroupRepository: Repository<ConsumerGroup>,
        @InjectRepository(Consumer)
        private readonly consumerRepository: Repository<Consumer>,
    ) {}

    private async saveConsumerGroup(
        group: ConsumerGroup,
    ): Promise<ConsumerGroup> {
        return this.consumerGroupRepository.save(group);
    }

    async findAllConsumerGroups(appId: string): Promise<ConsumerGroup[]> {
        return this.consumerGroupRepository.find({
            where: { app: { id: appId } },
            order: { name: 'ASC' },
        });
    }

    async findConsumerGroup(
        appId: string,
        groupId: number,
    ): Promise<NullableType<ConsumerGroup>> {
        return this.consumerGroupRepository.findOne({
            where: { id: groupId, app: { id: appId } },
            relations: { consumers: true },
        });
    }

    async createConsumerGroup(
        appId: string,
        createConsumerGroupDto: CreateConsumerGroupDto,
    ): Promise<ConsumerGroup> {
        const group = this.consumerGroupRepository.create({
            name: createConsumerGroupDto.name,
            app: { id: appId },
        });

        if (
            createConsumerGroupDto.consumerIds &&
            createConsumerGroupDto.consumerIds.length > 0
        ) {
            const consumers = await this.consumerRepository.find({
                where: {
                    id: In(createConsumerGroupDto.consumerIds),
                    app: { id: appId },
                },
            });
            group.consumers = consumers;
        }

        return this.saveConsumerGroup(group);
    }

    async updateConsumerGroup(
        appId: string,
        groupId: number,
        updateConsumerGroupDto: UpdateConsumerGroupDto,
    ): Promise<void> {
        const group = await this.findConsumerGroup(appId, groupId);

        if (!group) {
            throw new Error('Consumer group not found');
        }

        group.name = updateConsumerGroupDto.name;

        if (updateConsumerGroupDto.consumerIds !== undefined) {
            if (
                updateConsumerGroupDto.consumerIds === null ||
                updateConsumerGroupDto.consumerIds.length === 0
            ) {
                group.consumers = [];
            } else {
                const consumers = await this.consumerRepository.find({
                    where: {
                        id: In(updateConsumerGroupDto.consumerIds),
                        app: { id: appId },
                    },
                });
                group.consumers = consumers;
            }
        }

        await this.saveConsumerGroup(group);
    }

    async deleteConsumerGroup(appId: string, groupId: number): Promise<void> {
        await this.consumerGroupRepository.delete({
            id: groupId,
            app: { id: appId },
        });
    }
}
