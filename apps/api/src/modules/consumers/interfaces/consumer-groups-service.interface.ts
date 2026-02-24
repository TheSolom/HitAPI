import type { QueryRunner } from 'typeorm';
import type { NullableType } from '../../../common/types/nullable.type.js';
import type { ConsumerGroup } from '../entities/consumer-group.entity.js';
import type { CreateConsumerGroupDto } from '../dto/create-consumer-group.dto.js';
import type { UpdateConsumerGroupDto } from '../dto/update-consumer-group.dto.js';

export interface IConsumerGroupsService {
    /**
     * List all consumer groups for an app.
     * @param appId - The ID of the application.
     * @returns A list of consumer groups.
     */
    findAllConsumerGroups(appId: string): Promise<ConsumerGroup[]>;
    /**
     * Find all consumer groups by names.
     * @param appId - The ID of the application.
     * @param names - The names of the consumer groups.
     * @param queryRunner - The query runner.
     * @returns A list of consumer groups.
     */
    findAllByNames(
        appId: string,
        names: string[],
        queryRunner?: QueryRunner,
    ): Promise<ConsumerGroup[]>;
    /**
     * Find a single consumer group by ID.
     * @param appId - The ID of the application.
     * @param groupId - The ID of the consumer group.
     * @returns The consumer group entity.
     */
    findConsumerGroup(
        appId: string,
        groupId: number,
    ): Promise<NullableType<ConsumerGroup>>;
    /**
     * Create a new consumer group.
     * @param appId - The ID of the application.
     * @param createConsumerGroupDto - The create data.
     * @returns The created group.
     */
    createConsumerGroup(
        appId: string,
        createConsumerGroupDto: CreateConsumerGroupDto,
    ): Promise<ConsumerGroup>;
    /**
     * Create many consumer groups.
     * @param appId - The ID of the application.
     * @param names - The names of the consumer groups.
     * @param queryRunner - The query runner.
     * @returns A list of created groups.
     */
    createManyConsumerGroups(
        appId: string,
        names: string[],
        queryRunner?: QueryRunner,
    ): Promise<{ id: number; name: string }[]>;
    /**
     * Update a consumer group.
     * @param appId - The ID of the application.
     * @param groupId - The ID of the consumer group.
     * @param updateConsumerGroupDto - The update data.
     */
    updateConsumerGroup(
        appId: string,
        groupId: number,
        updateConsumerGroupDto: UpdateConsumerGroupDto,
    ): Promise<void>;
    /**
     * Delete a consumer group.
     * @param appId - The ID of the application.
     * @param groupId - The ID of the consumer group.
     */
    deleteConsumerGroup(appId: string, groupId: number): Promise<void>;
}
