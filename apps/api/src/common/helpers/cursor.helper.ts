export type RequestLogCursorPayload = {
    timestamp: string;
    requestUuid: string;
};

/**
 * URL-safe base64 cursor encoder.
 */
export function encodeCursor(payload: object): string {
    return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

/**
 * URL-safe base64 cursor decoder.
 * Returns null if the cursor is missing, malformed, or not a JSON object.
 */
export function decodeCursor(
    cursor?: string | null,
): Record<string, unknown> | null {
    if (!cursor) return null;
    try {
        const decoded = Buffer.from(cursor, 'base64url').toString('utf8');
        const parsed = JSON.parse(decoded) as unknown;
        if (typeof parsed === 'object' && parsed !== null) {
            return parsed as Record<string, unknown>;
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Specialized type-safe decoder for request log cursor payloads.
 */
export function decodeRequestLogCursor(
    cursor?: string | null,
): RequestLogCursorPayload | null {
    const decoded = decodeCursor(cursor);
    if (
        decoded &&
        typeof decoded.timestamp === 'string' &&
        typeof decoded.requestUuid === 'string'
    ) {
        return {
            timestamp: decoded.timestamp,
            requestUuid: decoded.requestUuid,
        };
    }
    return null;
}
