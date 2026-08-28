import { isHttps } from '../../src/common/utils/index.js';

describe('isHttps', () => {
    it.each([
        'x-forwarded-proto',
        'x-forwarded-protocol',
        'x-forwarded-scheme',
        'x-url-scheme',
        'x-scheme',
    ])('returns true for %s with HTTPS', (header) => {
        expect(isHttps([[header, 'HTTPS']])).toBe(true);
        expect(isHttps([[header, 'https,http']])).toBe(true);
    });

    it.each(['front-end-https', 'x-forwarded-ssl'])(
        'returns true for %s when enabled',
        (header) => {
            expect(isHttps([[header, 'ON']])).toBe(true);
        },
    );

    it('returns true for an HTTPS Forwarded parameter', () => {
        expect(isHttps([['Forwarded', 'for=192.0.2.1;proto=https']])).toBe(
            true,
        );
    });

    it('returns false when the client-facing protocol is not HTTPS', () => {
        expect(isHttps([['x-forwarded-proto', 'http']])).toBe(false);
        expect(isHttps([['x-forwarded-proto', 'http,https']])).toBe(false);
        expect(isHttps([['front-end-https', 'off']])).toBe(false);
        expect(isHttps([['x-forwarded-ssl', 'true']])).toBe(false);
        expect(isHttps([['Forwarded', 'for=192.0.2.1;proto=http']])).toBe(
            false,
        );
        expect(isHttps([])).toBe(false);
    });

    it('ignores unsupported headers and values', () => {
        expect(isHttps([['x-real-proto', 'https']])).toBe(false);
        expect(isHttps([['x-forwarded-proto', 'https-invalid']])).toBe(false);
    });
});
