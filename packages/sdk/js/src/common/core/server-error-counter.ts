import { createHash } from 'node:crypto';
import type {
    ConsumerMethodPath,
    ServerError,
    ServerErrorsItem,
} from '@hitapi/types';
import { truncate } from '../utils/index.js';
import {
    MAX_MSG_LENGTH,
    MAX_STACKTRACE_LENGTH,
} from '../constants/server-error-counter.constant.js';

export default class ServerErrorCounter {
    readonly #errorCounts: Map<string, number>;
    readonly #errorDetails: Map<string, ConsumerMethodPath & ServerError>;

    constructor() {
        this.#errorCounts = new Map();
        this.#errorDetails = new Map();
    }

    public addServerError(serverError: ConsumerMethodPath & ServerError): void {
        const key = this.#getKey(serverError);

        if (!this.#errorDetails.has(key))
            this.#errorDetails.set(key, serverError);

        this.#errorCounts.set(key, (this.#errorCounts.get(key) || 0) + 1);
    }

    public getAndResetServerErrors(): ServerErrorsItem[] {
        const data: ServerErrorsItem[] = [];

        this.#errorCounts.forEach((count, key) => {
            const serverError = this.#errorDetails.get(key);

            if (serverError) {
                data.push({
                    consumer: serverError.consumer,
                    method: serverError.method,
                    path: serverError.path,
                    type: serverError.type,
                    msg: truncate(serverError.msg, MAX_MSG_LENGTH),
                    traceback: truncateExceptionStackTrace(
                        serverError.traceback,
                    ),
                    errorCount: count,
                });
            }
        });

        this.#errorCounts.clear();
        this.#errorDetails.clear();
        return data;
    }

    #getKey(serverError: ConsumerMethodPath & ServerError): string {
        const SEPARATOR = '█';
        const hashInput = [
            serverError.consumer,
            serverError.method.toUpperCase(),
            serverError.path,
            serverError.type,
            serverError.msg.trim(),
            serverError.traceback.trim(),
        ].join(SEPARATOR);

        return createHash('md5').update(hashInput).digest('hex');
    }
}

export function truncateExceptionStackTrace(stack: string): string {
    if (stack.length <= MAX_STACKTRACE_LENGTH) return stack;

    const SUFFIX = '... (truncated) ...';
    const cutoff = MAX_STACKTRACE_LENGTH - SUFFIX.length;
    const lines = stack.trim().split('\n');
    const truncatedLines: string[] = [];

    let length = 0;
    for (const line of lines) {
        if (length + line.length + 1 > cutoff) {
            truncatedLines.push(SUFFIX);
            break;
        }

        truncatedLines.push(line);
        length += line.length + 1;
    }

    return truncatedLines.join('\n');
}
