import { isValidUUID } from '../../src/common/utils/index.js';

describe('isValidUUID', () => {
    it('should return true for valid UUID v4', () => {
        const validUUIDs = [
            '3fd66fad-0ea5-4b3e-bdf2-aa86f0698961',
            'dac4c077-b1fc-438d-8496-464e0c9de90e',
        ];

        validUUIDs.forEach((uuid) => {
            expect(isValidUUID(uuid)).toBe(true);
        });
    });

    it('should return false for invalid UUID formats', () => {
        const invalidUUIDs = [
            '',
            'not-a-uuid',
            '1234567890',
            '123e4567-e89b-12d3-a456-42661417400', // Missing character
            '123e4567-e89b-12d3-a456-4266141740000', // Extra character
            '123e4567e89b12d3a456426614174000', // No hyphens
            '123e4567-e89b-12d3-a456-42661417400g', // Invalid character at the end
            '123e4567-e89b-01d3-a456-426614174000', // Version 0
            '123e4567-e89b-61d3-a456-426614174000', // Version 6
            '123e4567-e89b-42d3-7456-426614174000', // '7' is not a valid variant
            '123e4567-e89b-42d3-c456-426614174000', // 'c' is not a valid variant
            '123e4567-e89b-42d3-d456-426614174000', // 'd' is not a valid variant
            '123e4567-e89b-42d3-e456-426614174000', // 'e' is not a valid variant
            '123e4567-e89b-42d3-f456-426614174000', // 'f' is not a valid variant
        ];

        invalidUUIDs.forEach((uuid) => {
            expect(isValidUUID(uuid)).toBe(false);
        });
    });

    it('should handle edge cases', () => {
        expect(isValidUUID('123E4567-E89B-42D3-A456-426614174000')).toBe(true);
        expect(isValidUUID('123e4567-E89B-42d3-A456-426614174000')).toBe(true);
        expect(isValidUUID(undefined as unknown as string)).toBe(false);
        expect(isValidUUID(null as unknown as string)).toBe(false);
        expect(isValidUUID(123 as unknown as string)).toBe(false);
        expect(isValidUUID({} as unknown as string)).toBe(false);
    });

    describe('UUID versions', () => {
        it('should accept version 1-5', () => {
            for (let version = 1; version <= 5; version++) {
                const uuid = `123e4567-e89b-${version}123-a456-426614174000`;
                expect(isValidUUID(uuid)).toBe(true);
            }
        });

        it('should reject versions outside 1-5', () => {
            const invalidVersions = [0, 6, 7, 8, 9];
            invalidVersions.forEach((version) => {
                const uuid = `123e4567-e89b-${version}123-a456-426614174000`;
                expect(isValidUUID(uuid)).toBe(false);
            });
        });
    });

    describe('UUID variants', () => {
        it('should accept variants 8, 9, a, b', () => {
            const validVariants = ['8', '9', 'a', 'b', 'A', 'B'];
            validVariants.forEach((variant) => {
                const uuid = `123e4567-e89b-42d3-${variant}456-426614174000`;
                expect(isValidUUID(uuid)).toBe(true);
            });
        });

        it('should reject invalid variants', () => {
            const invalidVariants = [
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                'c',
                'd',
                'e',
                'f',
            ];
            invalidVariants.forEach((variant) => {
                const uuid = `123e4567-e89b-42d3-${variant}456-426614174000`;
                expect(isValidUUID(uuid)).toBe(false);
            });
        });
    });
});
