import { ALLOWED_CONTENT_TYPES } from '../request-logger/constants/index.js';

export function isSupportedContentType(
    contentType: string | null | undefined,
): boolean {
    return (
        typeof contentType === 'string' &&
        ALLOWED_CONTENT_TYPES.some((t) => contentType.startsWith(t))
    );
}
