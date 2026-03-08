import type { IncomingHttpHeaders, OutgoingHttpHeaders } from 'node:http';

function isValidJsonString(body: any): boolean {
    if (typeof body !== 'string') {
        return false;
    }

    try {
        JSON.parse(body);
        return true;
    } catch {
        return false;
    }
}

export function convertBody(body: any, contentType?: string): Buffer | null {
    if (!body || !contentType) return null;

    try {
        if (contentType.startsWith('application/json')) {
            if (isValidJsonString(body)) {
                return Buffer.from(body);
            } else {
                return Buffer.from(JSON.stringify(body));
            }
        }
        if (contentType.startsWith('text/') && typeof body === 'string') {
            return Buffer.from(body);
        }
    } catch {
        return null;
    }
    return null;
}

export function convertHeaders(
    headers:
        | Headers
        | IncomingHttpHeaders
        | OutgoingHttpHeaders
        | Record<string, string | string[] | number | undefined>
        | undefined,
): [string, string][] {
    if (!headers) {
        return [];
    }
    if (headers instanceof Headers) {
        return Array.from(headers.entries());
    }
    return Object.entries(headers).flatMap(([key, value]) => {
        if (value === undefined) {
            return [];
        }
        if (Array.isArray(value)) {
            return value.map((v) => [key, v]);
        }
        return [[key, value.toString()]];
    }) as [string, string][];
}
