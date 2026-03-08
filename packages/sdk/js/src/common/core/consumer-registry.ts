import type { ConsumerInfo } from '@hitapi/types';

export const consumerFromStringOrObject = (
    consumer: ConsumerInfo | string,
): ConsumerInfo | null => {
    if (typeof consumer === 'string') {
        consumer = String(consumer).trim().substring(0, 128);
        return consumer ? { identifier: consumer } : null;
    } else {
        consumer.identifier = String(consumer.identifier)
            .trim()
            .substring(0, 128);
        consumer.name = consumer.name?.trim().substring(0, 64);
        consumer.group = consumer.group?.trim().substring(0, 64);
        return consumer.identifier ? consumer : null;
    }
};

export default class ConsumerRegistry {
    readonly #consumers: Map<string, ConsumerInfo>;
    readonly #updated: Set<string>;

    constructor() {
        this.#consumers = new Map();
        this.#updated = new Set();
    }

    public addOrUpdateConsumer(consumer?: ConsumerInfo | null): void {
        if (!consumer || (!consumer.name && !consumer.group)) {
            return;
        }

        const existing = this.#consumers.get(consumer.identifier);
        if (existing) {
            if (consumer.name && consumer.name !== existing.name) {
                existing.name = consumer.name;
                this.#updated.add(consumer.identifier);
            }
            if (consumer.group && consumer.group !== existing.group) {
                existing.group = consumer.group;
                this.#updated.add(consumer.identifier);
            }
        } else {
            this.#consumers.set(consumer.identifier, consumer);
            this.#updated.add(consumer.identifier);
        }
    }

    public getAndResetUpdatedConsumers(): ConsumerInfo[] {
        const data: ConsumerInfo[] = [];
        this.#updated.forEach((identifier) => {
            const consumer = this.#consumers.get(identifier);
            if (consumer) {
                data.push(consumer);
            }
        });

        this.#updated.clear();
        return data;
    }
}
