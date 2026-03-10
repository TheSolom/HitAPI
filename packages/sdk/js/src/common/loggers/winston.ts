import { AsyncLocalStorage } from 'node:async_hooks';
import type { LogRecord } from '@hitapi/types';
import { MAX_BUFFER_SIZE } from '../constants/logger.constant.js';
import { removeKeys, formatMessage } from './utils.js';

let isPatched = false;
let globalLogsContext: AsyncLocalStorage<LogRecord[]>;

interface WinstonLogger {
    prototype: {
        write: (info: Record<string, unknown>) => unknown;
    };
}

export async function patchWinston(
    logsContext: AsyncLocalStorage<LogRecord[]>,
): Promise<void> {
    globalLogsContext = logsContext;

    if (isPatched) return;

    try {
        const loggerModule = (await import(
            // @ts-expect-error - file is not typed
            'winston/lib/winston/logger.js'
        )) as { default: WinstonLogger };
        const Logger = loggerModule.default;

        if (Logger?.prototype?.write) {
            const originalWrite = Logger.prototype.write;
            Logger.prototype.write = function (
                info: Record<string, unknown>,
            ): unknown {
                captureLog(info);
                return originalWrite.call(this, info);
            };
        }
    } catch {
        // winston is not installed, silently ignore
    }

    isPatched = true;
}

function captureLog(info: Record<string, unknown>): void {
    if (!Object.keys(info).length) return;

    const logs = globalLogsContext?.getStore();
    if (!logs || logs.length >= MAX_BUFFER_SIZE) return;

    try {
        const rest = removeKeys(info, [
            'timestamp',
            'level',
            'message',
            'splat',
        ]);
        const formattedMessage = formatMessage(info.message as string, rest);
        if (formattedMessage) {
            logs.push({
                level: (info.level as string) || 'info',
                message: formattedMessage.trim(),
                timestamp: parseTimestamp(info?.timestamp),
            });
        }
    } catch {
        // ignore
    }
}

function parseTimestamp(timestamp?: unknown): number {
    if (timestamp) {
        const timeMs = new Date(timestamp as string | number | Date).getTime();
        if (!Number.isNaN(timeMs)) {
            return timeMs;
        }
    }
    return Date.now();
}
