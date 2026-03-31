import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';
import { configureCors } from './cors.bootstrap.js';
import { configureApi } from './api.bootstrap.js';
import { configureGlobalProviders } from './providers.bootstrap.js';
import { configureMiddleware } from './middleware.bootstrap.js';
import { configureSecurity } from './security.bootstrap.js';

export async function configureApp(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): Promise<void> {
    configureCors(app, config, logger);
    configureApi(app, config, logger);
    await configureGlobalProviders(app, config, logger);
    configureMiddleware(app, config, logger);
    configureSecurity(app, config, logger);
}
