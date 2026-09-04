import { getCountryName } from '../country.util.js';

describe('country.util', () => {
    describe('getCountryName', () => {
        it('should return "Unknown" when countryCode is null or undefined or empty', () => {
            expect(getCountryName(null)).toBe('Unknown');
            expect(getCountryName(undefined)).toBe('Unknown');
            expect(getCountryName('')).toBe('Unknown');
        });

        it('should return country name for valid code if registered or "Unknown"', () => {
            const result = getCountryName('US');
            expect(typeof result).toBe('string');
        });

        it('should return "Unknown" for invalid country codes', () => {
            expect(getCountryName('INVALID_CODE_XYZ')).toBe('Unknown');
        });
    });
});
