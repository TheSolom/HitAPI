import { createSlug } from '../slug.util.js';

describe('slug.util', () => {
    describe('createSlug', () => {
        it('should convert text to lowercase slug', () => {
            expect(createSlug('My Test Application')).toBe(
                'my-test-application',
            );
        });

        it('should strip special characters and trim', () => {
            expect(createSlug('  Hello World! ')).toBe('hello-world');
        });

        it('should handle already slugified strings', () => {
            expect(createSlug('already-slugified')).toBe('already-slugified');
        });
    });
});
