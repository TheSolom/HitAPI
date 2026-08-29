import ConsumerRegistry, {
    consumerFromStringOrObject,
} from '../../src/common/core/consumer-registry.js';

describe('Consumer registry', () => {
    it('Consumer from string or object', () => {
        let consumer = consumerFromStringOrObject('');
        expect(consumer).toBeNull();

        consumer = consumerFromStringOrObject({ identifier: ' ' });
        expect(consumer).toBeNull();

        consumer = consumerFromStringOrObject('test');
        expect(consumer).toEqual({
            identifier: 'test',
        });

        consumer = consumerFromStringOrObject({ identifier: 'test' });
        expect(consumer).toEqual({
            identifier: 'test',
        });

        consumer = consumerFromStringOrObject({
            identifier: 'test',
            name: 'Test ',
            group: ' Testers ',
        });
        expect(consumer).toEqual({
            identifier: 'test',
            name: 'Test',
            group: 'Testers',
        });
    });

    it('Add or update consumers', () => {
        const consumerRegistry = new ConsumerRegistry();
        consumerRegistry.addOrUpdateConsumer(null);
        let data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(0);

        consumerRegistry.addOrUpdateConsumer({ identifier: 'test' });
        data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(1);
        expect(data[0]).toEqual({ identifier: 'test' });

        consumerRegistry.addOrUpdateConsumer({ identifier: 'test' });
        data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(0);

        const testConsumer = {
            identifier: 'test',
            name: 'Test',
            group: 'Testers',
        };
        consumerRegistry.addOrUpdateConsumer(testConsumer);
        data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(1);
        expect(data[0]).toEqual(testConsumer);

        consumerRegistry.addOrUpdateConsumer(testConsumer);
        data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(0);

        consumerRegistry.addOrUpdateConsumer({
            identifier: 'test',
            name: 'Test 2',
            group: 'Testers 2',
        });
        data = consumerRegistry.getAndResetUpdatedConsumers();
        expect(data).toHaveLength(1);
    });
});
