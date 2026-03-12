import { AsyncLocalStorage } from 'node:async_hooks';
import type { LogRecord } from '@hitapi/types';
import { type LogLevel } from '@nestjs/common';
import { MAX_BUFFER_SIZE } from '../constants/logger.constant.js';
import { formatMessage } from './utils.js';

let isPatched = false;
let globalLogsContext: AsyncLocalStorage<LogRecord[]>;

export async function patchNestLogger(
    logsContext: AsyncLocalStorage<LogRecord[]>,
) {
    globalLogsContext = logsContext;

    if (isPatched) return;

    try {
        const { Logger, LOG_LEVELS } = await import('@nestjs/common');

        // Patch static methods
        LOG_LEVELS.forEach((method) => {
            const originalMethod = Logger[method];
            Logger[method] = function (message: unknown, ...args: unknown[]) {
                captureLog(method, [message, ...args]);
                return originalMethod.apply(Logger, [message, ...args]);
            };
        });

        // Patch prototype methods to affect all instances (new and existing)
        LOG_LEVELS.forEach((method) => {
            const originalMethod = Logger.prototype[method];
            Logger.prototype[method] = function (
                this: { context?: string },
                message: unknown,
                ...args: unknown[]
            ) {
                captureLog(method, [message, ...args], this.context);
                return originalMethod.apply(this, [message, ...args]);
            };
        });

        isPatched = true;
    } catch {
        // @nestjs/common is not installed, silently ignore
    }
}

function captureLog(level: LogLevel, args: unknown[], context?: string) {
    const logs = globalLogsContext?.getStore();
    if (logs && logs.length < MAX_BUFFER_SIZE) {
        logs.push({
            level,
            message: formatMessage(args[0], ...args.slice(1)),
            timestamp: Date.now(),
            logger: context,
        });
    }
}
