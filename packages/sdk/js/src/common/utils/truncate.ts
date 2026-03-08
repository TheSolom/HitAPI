import { TRUNCATED_SUFFIX } from '../request-logger/constants/request-logger.constants.js';

export function truncate(str: string, maxSize: number): string;
export function truncate(str: Buffer, maxSize: number): Buffer;
export function truncate(
    str: string | Buffer,
    maxSize: number,
): string | Buffer {
    if (Buffer.byteLength(str) <= maxSize) {
        return str;
    }

    if (Buffer.isBuffer(str)) {
        return Buffer.concat([
            str.subarray(0, maxSize - TRUNCATED_SUFFIX.length),
            Buffer.from(TRUNCATED_SUFFIX),
        ]);
    }

    return str.slice(0, maxSize - TRUNCATED_SUFFIX.length) + TRUNCATED_SUFFIX;
}
