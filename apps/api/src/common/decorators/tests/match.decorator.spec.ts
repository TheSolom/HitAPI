import { validate } from 'class-validator';
import { Match, DoesNotMatch } from '../match.decorator.js';

class PasswordTestDto {
    newPassword = 'Password123!';

    @Match('newPassword')
    confirmPassword = 'Password123!';

    @DoesNotMatch('newPassword')
    currentPassword = 'OldPassword123!';
}

describe('Match & DoesNotMatch Decorators', () => {
    it('should validate when match property matches and doesNotMatch property differs', async () => {
        const dto = new PasswordTestDto();
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('should fail when match property does not equal target', async () => {
        const dto = new PasswordTestDto();
        dto.confirmPassword = 'DifferentPassword!';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('confirmPassword');
        expect(errors[0].constraints?.match).toBeDefined();
    });

    it('should fail when doesNotMatch property equals target', async () => {
        const dto = new PasswordTestDto();
        dto.currentPassword = 'Password123!';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].property).toBe('currentPassword');
        expect(errors[0].constraints?.doesNotMatch).toBeDefined();
    });
});
