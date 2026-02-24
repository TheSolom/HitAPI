import type { QueryRunner } from 'typeorm';
import type { NullableType } from '../../../common/types/nullable.type.js';
import type { Consumer } from '../entities/consumer.entity.js';
import type { CreateConsumerDto } from '../dto/create-consumer.dto.js';
import type { UpdateConsumerDto } from '../dto/update-consumer.dto.js';

export interface IConsumersService {
    /**
     * List all consumers for an app.
     * @param appId - The ID of the application.
     * @returns A list of consumers.
     */
    findAllByAppId(appId: string): Promise<Consumer[]>;
    /**
     * List all consumers by identifiers.
     * @param appId - The ID of the application.
     * @param identifiers - The identifiers of the consumers.
     * @param queryRunner - The query runner.
     * @returns A list of consumers.
     */
    findAllByIdentifiers(
        appId: string,
        identifiers: string[],
        queryRunner?: QueryRunner,
    ): Promise<Consumer[]>;
    /**
     * Find a single consumer by ID.
     * @param appId - The ID of the application.
     * @param consumerId - The ID of the consumer.
     * @returns The consumer entity.
     */
    findById(
        appId: string,
        consumerId: number,
    ): Promise<NullableType<Consumer>>;
    /**
     * Find a single consumer by identifier.
     * @param appId - The ID of the application.
     * @param identifier - The identifier of the consumer.
     * @returns The consumer entity.
     */
    findByIdentifier(
        appId: string,
        identifier: string,
    ): Promise<NullableType<Consumer>>;
    /**
     * Create new consumers.
     * @param appId - The ID of the application.
     * @param createConsumersDto - The create data.
     * @param queryRunner - The query runner.
     * @returns The consumers ids and identifiers.
     */
    createConsumers(
        appId: string,
        createConsumersDto: CreateConsumerDto[],
        queryRunner?: QueryRunner,
    ): Promise<{ id: number; identifier: string }[]>;
    /**
     * Update a consumer.
     * @param appId - The ID of the application.
     * @param consumerId - The ID of the consumer.
     * @param updateConsumerDto - The update data.
     * @param queryRunner - The query runner.
     */
    updateConsumer(
        appId: string,
        consumerId: number,
        updateConsumerDto: UpdateConsumerDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
}
