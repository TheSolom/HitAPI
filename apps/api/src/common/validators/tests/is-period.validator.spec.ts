import { validate } from 'class-validator';
import { IsPeriod } from '../is-period.validator.js';

class PeriodTestDto {
    @IsPeriod()
    period: string;

    constructor(period: string) {
        this.period = period;
    }
}

describe('IsPeriod Validator', () => {
    it('should validate valid relative time periods', async () => {
        const validPeriods = ['24h', '7d', '30m', '1y', '500ms'];

        for (const period of validPeriods) {
            const dto = new PeriodTestDto(period);
            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        }
    });

    it('should validate valid date range periods (start|end)', async () => {
        const validRange = '2026-01-01T00:00:00.000Z|2026-01-02T00:00:00.000Z';
        const dto = new PeriodTestDto(validRange);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('should reject invalid period formats and inverted ranges', async () => {
        const invalidPeriods = [
            'not-a-period',
            '2026-01-02T00:00:00.000Z|2026-01-01T00:00:00.000Z', // start > end
            'invalid-date|also-invalid',
            '|',
        ];

        for (const period of invalidPeriods) {
            const dto = new PeriodTestDto(period);
            const errors = await validate(dto);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors[0].constraints?.IsPeriod).toBeDefined();
        }
    });
});
