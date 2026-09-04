import { jest } from '@jest/globals';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { ClientAuthGuard } from '../client-auth.guard.js';
import type { IAppsService } from '../../../apps/interfaces/apps-service.interface.js';

describe('ClientAuthGuard', () => {
    let guard: ClientAuthGuard;
    let appsServiceMock: {
        findByClientId: jest.Mock<any>;
    };

    const createMockExecutionContext = (
        headers: Record<string, string | undefined>,
    ): { context: ExecutionContext; request: any } => {
        const request: any = { headers };
        const context = {
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        } as unknown as ExecutionContext;

        return { context, request };
    };

    beforeEach(() => {
        appsServiceMock = {
            findByClientId: jest.fn<any>(),
        };
        guard = new ClientAuthGuard(appsServiceMock as unknown as IAppsService);
    });

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    it('should throw UnauthorizedException when X-Client-ID header is missing', async () => {
        const { context } = createMockExecutionContext({});

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('Missing X-Client-ID header'),
        );
    });

    it('should throw UnauthorizedException when app is not found', async () => {
        const { context } = createMockExecutionContext({
            'x-client-id': 'unknown-client',
        });
        appsServiceMock.findByClientId.mockResolvedValue(null);

        await expect(guard.canActivate(context)).rejects.toThrow(
            new UnauthorizedException('Invalid client ID'),
        );
    });

    it('should throw ForbiddenException when app is not active', async () => {
        const { context } = createMockExecutionContext({
            'x-client-id': 'inactive-client',
        });
        appsServiceMock.findByClientId.mockResolvedValue({
            id: 'app-1',
            active: false,
        });

        await expect(guard.canActivate(context)).rejects.toThrow(
            new ForbiddenException('App is not active'),
        );
    });

    it('should attach app to request and return true when active and valid', async () => {
        const { context, request } = createMockExecutionContext({
            'x-client-id': 'valid-client',
        });
        const app = {
            id: 'app-1',
            active: true,
            name: 'Production App',
        };
        appsServiceMock.findByClientId.mockResolvedValue(app);

        const result = await guard.canActivate(context);

        expect(result).toBe(true);
        expect(request.userApp).toEqual(app);
    });
});
