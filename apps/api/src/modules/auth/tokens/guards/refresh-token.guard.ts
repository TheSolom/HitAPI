import {
    Inject,
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Services } from '../../../../common/constants/services.constant.js';
import type { ITokensService } from '../interfaces/tokens-service.interface.js';
import { REFRESH_TOKEN_COOKIE } from '../../utils/auth-cookie.util.js';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        @Inject(Services.TOKENS) private readonly tokensService: ITokensService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const cookies = request.cookies as Record<string, string> | undefined;
        const body = request.body as { refreshToken?: string } | undefined;
        const headerToken = request.headers['x-refresh-token'];

        const refreshToken =
            cookies?.[REFRESH_TOKEN_COOKIE] ||
            body?.refreshToken ||
            (typeof headerToken === 'string' ? headerToken : undefined);

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing');
        }

        const storedToken =
            await this.tokensService.verifyRefreshToken(refreshToken);

        if (!storedToken?.user) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Revoke the used refresh token (rotation)
        await this.tokensService.revokeRefreshToken(refreshToken);

        request.user = storedToken.user;

        return true;
    }
}
