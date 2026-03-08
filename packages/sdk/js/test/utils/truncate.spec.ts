import { truncate } from '../../src/common/utils/index.js';
import { TRUNCATED_SUFFIX } from '../../src/common/request-logger/constants/request-logger.constants.js';

describe('truncate', () => {
    describe('when input is a string', () => {
        it('should return original string if within maxSize', () => {
            const str = 'hello';
            expect(truncate(str, 10)).toBe('hello');
        });

        it('should truncate and add suffix if exceeds maxSize', () => {
            const str = 'hello world';
            expect(truncate(str, 8)).toBe('hell' + TRUNCATED_SUFFIX);
        });

        it('should handle edge cases', () => {
            expect(truncate('', 5)).toBe('');
            expect(truncate('a', 1)).toBe('a');
            expect(truncate('ab', 2)).toBe('ab');
            expect(truncate('abc', 3)).toBe('abc');
        });
    });

    describe('when input is a buffer', () => {
        it('should return original buffer if within maxSize', () => {
            const buffer = Buffer.from('hello');
            expect(truncate(buffer, 10)).toBe(buffer);
        });

        it('should truncate and add suffix if exceeds maxSize', () => {
            const buffer = Buffer.from('hello world');
            const result = truncate(buffer, 8);

            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBe('hell' + TRUNCATED_SUFFIX);
        });

        it('should handle edge cases', () => {
            const emptyBuffer = Buffer.from('');
            expect(truncate(emptyBuffer, 5)).toBe(emptyBuffer);

            const smallBuffer = Buffer.from('a');
            expect(truncate(smallBuffer, 1)).toBe(smallBuffer);
        });
    });

    it('should handle multibyte characters correctly', () => {
        const str = 'こんにちは世界';
        expect(truncate(str, 10)).toBe('こん' + TRUNCATED_SUFFIX);
    });
});
