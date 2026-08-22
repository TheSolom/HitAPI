import type { Response } from 'express';
import type { ConfigService } from '@nestjs/config';
import { Environment } from '@hitapi/types';
import type { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';

export const REFRESH_TOKEN_COOKIE = 'refresh_token';

export function setRefreshTokenCookie(
    res: Response,
    refreshToken: string,
    configService: ConfigService<EnvironmentVariablesDto, true>,
): void {
    const nodeEnv = configService.get<Environment>('NODE_ENV');
    const isProduction = nodeEnv === Environment.Production;
    const expirationTimeSeconds = configService.get<number>(
        'REFRESH_TOKEN_EXPIRATION_TIME',
    );

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        maxAge: expirationTimeSeconds * 1000,
    });
}

export function clearRefreshTokenCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
        httpOnly: true,
        path: '/',
    });
}
