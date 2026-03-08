import { parseContentLength } from '../../src/common/utils/index.js';

describe('Parser utils', () => {
    it('Parse content length', () => {
        expect(parseContentLength(100)).toBe(100);
        expect(parseContentLength('100')).toBe(100);
        expect(parseContentLength(['100', '200'])).toBe(100);
        expect(parseContentLength(undefined)).toBeUndefined();
        expect(parseContentLength(null)).toBeUndefined();
        expect(parseContentLength('')).toBeUndefined();
        expect(parseContentLength('abc')).toBeUndefined();
    });
});
