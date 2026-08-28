import { AsyncLocalStorage } from 'node:async_hooks';
import type { LogRecord } from '@hitapi/types';
import { type LogLevel } from '@nestjs/common';
import { MAX_BUFFER_SIZE } from '../constants/logger.constant.js';
import { formatMessage } from './utils.js';

let isPatched = false;
let globalLogsContext: AsyncLocalStorage<LogRecord[]> | undefined;

export async function patchNestLogger(
    logsContext: AsyncLocalStorage<LogRecord[]>,
) {
    globalLogsContext = logsContext;

    if (isPatched) return;

    try {
        const { Logger, LOG_LEVELS } = await import('@nestjs/common');

        // Patch static methods
        LOG_LEVELS.forEach((method) => {
            const originalMethod = (
                Logger[method] as (
                    this: typeof Logger,
                    ...args: unknown[]
                ) => void
            ).bind(Logger);
            Logger[method] = function (message: unknown, ...args: unknown[]) {
                captureLog(method, [message, ...args]);
                originalMethod(message, ...args);
            };
        });

        // Patch prototype methods to affect all instances (new and existing)
        LOG_LEVELS.forEach((method) => {
            const originalMethod = Reflect.get(Logger.prototype, method) as (
                this: { context?: string },
                ...args: unknown[]
            ) => void;
            Logger.prototype[method] = function (
                this: { context?: string },
                message: unknown,
                ...args: unknown[]
            ) {
                captureLog(method, [message, ...args], this.context);
                originalMethod.apply(this, [message, ...args]);
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
