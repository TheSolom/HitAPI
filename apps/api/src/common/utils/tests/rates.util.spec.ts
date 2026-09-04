import { calculateRate } from '../rates.util.js';

describe('rates.util', () => {
    describe('calculateRate', () => {
        it('should return 0 if denominator is 0 or negative', () => {
            expect(calculateRate(10, 0)).toBe(0);
            expect(calculateRate(10, -5)).toBe(0);
        });

        it('should calculate percentage with default precision of 2', () => {
            expect(calculateRate(1, 3)).toBe(33.33);
            expect(calculateRate(50, 100)).toBe(50);
            expect(calculateRate(1, 2)).toBe(50);
        });

        it('should calculate percentage with custom precision', () => {
            expect(calculateRate(1, 3, 0)).toBe(33);
            expect(calculateRate(1, 3, 4)).toBe(33.3333);
        });

        it('should handle 0 numerator', () => {
            expect(calculateRate(0, 100)).toBe(0);
        });
    });
});
