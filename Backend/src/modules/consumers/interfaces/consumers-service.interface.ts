import type { NullableType } from '../../../common/@types/nullable.type.js';
import type { Consumer } from '../entities/consumer.entity.js';
import type { UpdateConsumerDto } from '../dto/update-consumer.dto.js';

export interface IConsumersService {
    /**
     * List all consumers for an app.
     * @param appId - The ID of the application.
     * @returns A list of consumers.
     */
    findAllConsumers(appId: string): Promise<Consumer[]>;
    /**
     * Find a single consumer by ID.
     * @param appId - The ID of the application.
     * @param consumerId - The ID of the consumer.
     * @returns The consumer entity.
     */
    findConsumer(
        appId: string,
        consumerId: number,
    ): Promise<NullableType<Consumer>>;
    /**
     * Update a consumer.
     * @param appId - The ID of the application.
     * @param consumerId - The ID of the consumer.
     * @param updateConsumerDto - The update data.
     */
    updateConsumer(
        appId: string,
        consumerId: number,
        updateConsumerDto: UpdateConsumerDto,
    ): Promise<void>;
}
