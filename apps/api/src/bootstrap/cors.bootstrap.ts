import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';
import { Environment } from '../common/enums/environment.enum.js';

export function configureCors(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): void {
    const isProduction =
        config.get<Environment>('NODE_ENV') === Environment.Production;

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
            'X-Client-Id',
        ],
        exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
        credentials: true,
        maxAge: 3600,
    });

    logger.log(`CORS enabled for origin: ${allowedOrigin}`);
}
