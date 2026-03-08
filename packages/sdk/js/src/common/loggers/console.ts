import { AsyncLocalStorage } from 'node:async_hooks';
import { format } from 'node:util';
import type { LogRecord } from '@hitapi/types';
import { MAX_BUFFER_SIZE } from '../constants/logger.constant.js';

type LogLevel = 'log' | 'warn' | 'error' | 'info' | 'debug';

let isPatched = false;
let globalLogsContext: AsyncLocalStorage<LogRecord[]>;

export function patchConsole(logsContext: AsyncLocalStorage<LogRecord[]>) {
    globalLogsContext = logsContext;

    if (isPatched) return;

    const logMethods: LogLevel[] = ['log', 'warn', 'error', 'info', 'debug'];
    logMethods.forEach((method) => {
        const originalMethod = console[method];
        console[method] = function (...args: unknown[]): void {
            captureLog(method, args);
            return originalMethod.apply(console, args);
        };
    });

    isPatched = true;
}

function captureLog(level: LogLevel, args: unknown[]) {
    const logs = globalLogsContext?.getStore();
    if (logs && logs.length < MAX_BUFFER_SIZE) {
        logs.push({
            level,
            message: format(...args),
            timestamp: Date.now(),
            logger: 'console',
        });
    }
}
