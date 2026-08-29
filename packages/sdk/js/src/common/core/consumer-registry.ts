import type { ConsumerInfo } from '@hitapi/types';

export const consumerFromStringOrObject = (
    consumer: ConsumerInfo | string,
): ConsumerInfo | null => {
    if (typeof consumer === 'string') {
        consumer = consumer.trim().substring(0, 128);
        return consumer ? { identifier: consumer } : null;
    } else {
        consumer.identifier = consumer.identifier.trim().substring(0, 128);
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
        if (!consumer?.identifier) {
            return;
        }

        const existing = this.#consumers.get(consumer.identifier);
        if (existing) {
            let updated = false;
            if (consumer.name && consumer.name !== existing.name) {
                existing.name = consumer.name;
                updated = true;
            }
            if (consumer.group && consumer.group !== existing.group) {
                existing.group = consumer.group;
                updated = true;
            }
            if (
                consumer.hidden !== undefined &&
                consumer.hidden !== existing.hidden
            ) {
                existing.hidden = consumer.hidden;
                updated = true;
            }

            if (updated) {
                this.#updated.add(consumer.identifier);
            }
        } else {
            this.#consumers.set(consumer.identifier, { ...consumer });
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
