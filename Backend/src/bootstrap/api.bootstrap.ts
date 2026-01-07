import { Logger, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export function configureApi(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
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
