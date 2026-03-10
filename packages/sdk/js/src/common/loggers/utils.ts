import { format } from 'node:util';

export function removeKeys(
    obj: Record<string, unknown>,
    keys: string[],
): Record<string, unknown> {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => !keys.includes(key)),
    );
}

export function formatMessage(message: unknown, ...args: unknown[]): string {
    return [message, ...args]
        .map(formatArg)
        .filter((arg) => arg !== '')
        .join('\n');
}

function isEmptyObject(obj: unknown): boolean {
    return (
        obj !== null &&
        typeof obj === 'object' &&
        Object.getPrototypeOf(obj) === Object.prototype &&
        Object.keys(obj).length === 0
    );
}

function formatArg(arg: unknown): string {
    if (typeof arg === 'string') {
        return arg.trim();
    }
    if (arg instanceof Error) {
        return format(arg).trim();
    }
    if (arg === undefined || arg === null || isEmptyObject(arg)) {
        return '';
    }

    try {
        return JSON.stringify(arg);
    } catch {
        return format(arg).trim();
    }
}
