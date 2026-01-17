import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Logger } from '@nestjs/common';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import { configureCors } from './cors.bootstrap.js';
import { configureApi } from './api.bootstrap.js';
import { configureGlobalProviders } from './providers.bootstrap.js';
import { configureMiddleware } from './middleware.bootstrap.js';
import { configureSecurity } from './security.bootstrap.js';

export function configureApp(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    configureCors(app, config, logger);
    configureApi(app, config, logger);
    configureGlobalProviders(app, config, logger);
    configureMiddleware(app, config, logger);
    configureSecurity(app, config, logger);
}
