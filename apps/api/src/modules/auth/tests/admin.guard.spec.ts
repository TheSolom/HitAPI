import type { ExecutionContext } from '@nestjs/common';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AdminGuard } from '../guards/admin.guard.js';
import type { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';

describe('AdminGuard', () => {
    let guard: AdminGuard;

    beforeEach(() => {
        guard = new AdminGuard();
    });

    const createMockExecutionContext = (
        user?: Partial<AuthenticatedUser>,
    ): ExecutionContext => {
        const req = { user };
        return {
            switchToHttp: () => ({
                getRequest: () => req,
            }),
        } as unknown as ExecutionContext;
    };

    it('should allow access if user is admin', () => {
        const context = createMockExecutionContext({
            id: 'user-uuid',
            email: 'admin@example.com',
            isAdmin: true,
        });

        expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if user is not admin', () => {
        const context = createMockExecutionContext({
            id: 'user-uuid',
            email: 'member@example.com',
            isAdmin: false,
        });

        expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException if no user is present', () => {
        const context = createMockExecutionContext(undefined);

        expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
});
