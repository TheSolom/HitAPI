import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';
import { Environment } from '@hitapi/types';

export function configureCors(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): void {
    const isProduction =
        config.get<Environment>('NODE_ENV') === Environment.Production;
    const frontendUrl = config.get<string>('FRONTEND_URL');

    const allowedOrigins = isProduction
        ? frontendUrl
        : [frontendUrl, 'http://localhost:4000'];

    app.enableCors({
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Authorization',
            'Content-Type',
            'Accept',
            'X-Requested-With',
            'X-Client-Id',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        credentials: true,
        maxAge: 3600,
    });

    logger.log(`CORS enabled with credentials for: ${frontendUrl}`);
}
