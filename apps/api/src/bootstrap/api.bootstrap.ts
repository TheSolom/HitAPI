import { VersioningType } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';

export function configureApi(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): void {
    const apiPrefix = config.get<string>('API_PREFIX', 'api');

    app.setGlobalPrefix(apiPrefix, { exclude: ['health', 'metrics'] });

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
        prefix: 'v',
    });

    logger.log(`API prefix set to: /${apiPrefix}`);
}
