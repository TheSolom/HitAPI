import type { OutgoingHttpHeader } from 'node:http';

export function parseContentLength(
    contentLength: OutgoingHttpHeader | null | undefined,
): number | undefined {
    if (typeof contentLength === 'number') {
        return contentLength;
    }
    if (typeof contentLength === 'string') {
        const parsed = Number.parseInt(contentLength);
        return Number.isNaN(parsed) ? undefined : parsed;
    }
    if (Array.isArray(contentLength)) {
        return parseContentLength(contentLength[0]);
    }
    return undefined;
}
