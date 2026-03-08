import { isSupportedContentType } from '../../src/common/utils/index.js';
import { ALLOWED_CONTENT_TYPES } from '../../src/common/request-logger/constants/index.js';

describe('isSupportedContentType', () => {
    it('should return true for valid content types', () => {
        ALLOWED_CONTENT_TYPES.forEach((type) =>
            expect(isSupportedContentType(type)).toBe(true),
        );
    });

    it('should return false for invalid content types', () => {
        const invalidTypes = [
            'image/jpeg',
            'audio/mpeg',
            'application/pdf',
            '',
            ' text/plain',
        ];

        invalidTypes.forEach((type) =>
            expect(isSupportedContentType(type)).toBe(false),
        );
    });

    it('should return false for non-string inputs', () => {
        const nonStrings = [undefined, null, 123, {}, [], true];
        nonStrings.forEach((input) =>
            expect(isSupportedContentType(input as unknown as string)).toBe(
                false,
            ),
        );
    });
});
