import { type NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export function configureCors(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    if (!isProduction) {
        app.enableCors();
        logger.warn('CORS enabled for all origins (development mode)');
        return;
    }

    const allowedOrigin = config.getOrThrow<string>('FRONTEND_URL');

    app.enableCors({
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept',
            'X-Requested-With',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        credentials: true,
        maxAge: 3600,
    });

    logger.log(`CORS enabled for origin: ${allowedOrigin}`);
}
