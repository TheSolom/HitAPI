import { jest } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { RefreshTokenGuard } from '../refresh-token.guard.js';
import type { ITokensService } from '../../interfaces/tokens-service.interface.js';
import { REFRESH_TOKEN_COOKIE } from '../../../utils/auth-cookie.util.js';

describe('RefreshTokenGuard', () => {
    let guard: RefreshTokenGuard;
    let tokensServiceMock: {
        verifyRefreshToken: jest.Mock<any>;
        revokeRefreshToken: jest.Mock<any>;
    };

    const createMockExecutionContext = (
        reqData: {
            cookies?: Record<string, string>;
            body?: { refreshToken?: string };
            headers?: Record<string, string>;
        } = {},
    ): { context: ExecutionContext; request: any } => {
        const request: any = {
            cookies: reqData.cookies ?? {},
            body: reqData.body ?? {},
            headers: reqData.headers ?? {},
        };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as unknown as ExecutionContext;

        return { context, request };
    };

    beforeEach(() => {
        tokensServiceMock = {
            verifyRefreshToken: jest.fn<any>(),
            revokeRefreshToken: jest.fn<any>(async () => {}),
        };
        guard = new RefreshTokenGuard(
            tokensServiceMock as unknown as ITokensService,
        );
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw UnauthorizedException when refresh token is missing across cookies, body, and headers', async () => {
        const { context } = createMockExecutionContext();

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('Refresh token is missing'),
        );
    });

    it('should throw UnauthorizedException when stored token or token user is invalid', async () => {
        const { context } = createMockExecutionContext({
            cookies: { [REFRESH_TOKEN_COOKIE]: 'invalid-token' },
        });
        tokensServiceMock.verifyRefreshToken.mockResolvedValue(null);

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('Invalid or expired refresh token'),
        );
    });

    it('should revoke old token, attach user to request, and return true upon successful verification', async () => {
        const { context, request } = createMockExecutionContext({
            headers: { 'x-refresh-token': 'valid-header-token' },
        });
        const mockUser = { id: 'user-1', email: 'user@example.com' };
        tokensServiceMock.verifyRefreshToken.mockResolvedValue({
            id: 'tok-1',
            user: mockUser,
        });

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(tokensServiceMock.revokeRefreshToken).toHaveBeenCalledWith(
            'valid-header-token',
        );
        expect(request.user).toEqual(mockUser);
    });
});
