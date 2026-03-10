import { AsyncLocalStorage } from 'node:async_hooks';
import type { LogRecord } from '@hitapi/types';
import { patchConsole } from '../../src/common/loggers/index.js';

describe('Console logger', () => {
    const logsContext = new AsyncLocalStorage<LogRecord[]>();

    beforeAll(() => {
        patchConsole(logsContext);
    });

    it('Log formatting', () => {
        logsContext.run([], () => {
            console.log('test', { foo: 'bar' });
            console.error('test', new Error('test'));
            console.debug('test %d', 1, 2, 3);

            const logs = logsContext.getStore();
            expect(logs).toBeDefined();
            expect(logs).toHaveLength(3);
            expect(logs![0].level).toBe('log');
            expect(logs![0].message).toBe("test { foo: 'bar' }");
            expect(logs![1].level).toBe('error');
            expect(logs![1].message).toMatch(/^test Error: test\n/);
            expect(logs![2].level).toBe('debug');
            expect(logs![2].message).toBe('test 1 2 3');
        });
    });
});
