import { AsyncLocalStorage } from 'node:async_hooks';
import { type DestinationStream, Logger } from 'pino';
import type { LogRecord } from '@hitapi/types';
import { MAX_BUFFER_SIZE } from '../constants/logger.constant.js';
import { removeKeys, formatMessage } from './utils.js';

const originalStreamSym = Symbol.for('hitAPI.originalStream');

const logLevelMap: Record<number, string> = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

const BASE_IGNORE_KEYS = [
    'hostname',
    'level',
    'pid',
    'time',
    'reqId',
    'req',
    'res',
];

export async function patchPino(
    logger: Logger,
    logsContext: AsyncLocalStorage<LogRecord[]>,
): Promise<boolean> {
    try {
        const loggerAsRecord = logger as unknown as Record<symbol, unknown>;

        const symbols = [
            ...Object.getOwnPropertySymbols(logger),
            ...Object.getOwnPropertySymbols(Object.getPrototypeOf(logger)),
        ];

        const streamSym = symbols.find(
            (sym) => sym.toString() === 'Symbol(pino.stream)',
        );
        const messageKeySym = symbols.find(
            (sym) => sym.toString() === 'Symbol(pino.messageKey)',
        );

        if (!streamSym || !messageKeySym) return false;

        if (!(originalStreamSym in loggerAsRecord))
            loggerAsRecord[originalStreamSym] = loggerAsRecord[streamSym];

        const originalStream = loggerAsRecord[
            originalStreamSym
        ] as DestinationStream;
        if (!originalStream) return false;

        const pino = await import('pino');
        const messageKey = loggerAsRecord[messageKeySym];
        if (typeof messageKey !== 'string') return false;

        const captureStream = new HitAPILogCaptureStream(
            logsContext,
            messageKey,
        );

        loggerAsRecord[streamSym] = pino.default.multistream(
            [
                { level: 0, stream: originalStream },
                { level: 0, stream: captureStream },
            ],
            { levels: logger.levels.values },
        );

        return true;
    } catch {
        return false;
    }
}

class HitAPILogCaptureStream {
    readonly #logsContext: AsyncLocalStorage<LogRecord[]>;
    readonly #messageKey: string;

    constructor(
        logsContext: AsyncLocalStorage<LogRecord[]>,
        messageKey: string,
    ) {
        this.#logsContext = logsContext;
        this.#messageKey = messageKey;
    }

    write(msg: string): void {
        if (!msg) return;

        const logs = this.#logsContext.getStore();
        if (!logs || logs.length >= MAX_BUFFER_SIZE) return;

        let obj: Record<string, unknown>;
        try {
            obj = JSON.parse(msg) as Record<string, unknown>;
        } catch {
            return;
        }

        if (
            obj === null ||
            typeof obj !== 'object' ||
            !this.#shouldCaptureLog(obj, this.#messageKey)
        ) {
            return;
        }

        try {
            let message: unknown = obj[this.#messageKey];
            const ignoreKeys = [this.#messageKey, ...BASE_IGNORE_KEYS];

            if (!message && 'data' in obj && 'tags' in obj) {
                // hapi-pino uses data and tags instead of the message key
                message = obj.data;
                ignoreKeys.push('data', 'tags');
            }

            const rest = removeKeys(obj, ignoreKeys);
            const formattedMessage = formatMessage(message, rest);
            if (!formattedMessage) return;

            const time = obj.time;
            const timestamp = this.#convertTime(time);

            logs.push({
                level: logLevelMap[(obj.level as number) ?? 30] || 'info',
                message: formattedMessage,
                timestamp,
            });
        } catch {
            // ignore
        }
    }

    #shouldCaptureLog(
        obj: Record<string, unknown>,
        messageKey: string,
    ): boolean {
        return obj[messageKey] !== 'request completed';
    }

    #convertTime(time: unknown): number {
        if (typeof time === 'number' && !Number.isNaN(time)) {
            return time;
        }
        return Date.now();
    }
}
