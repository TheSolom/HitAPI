import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';
import { Environment } from '../common/enums/environment.enum.js';
import { Routes } from '../common/constants/routes.constant.js';

export async function startApp(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): Promise<void> {
    const PORT = config.get<number>('PORT', 3000);
    const HOST = config.get<string>('HOST', '0.0.0.0');
    const apiPrefix = config.get<string>('API_PREFIX', 'api');
    const nodeEnv = config.get<Environment>('NODE_ENV');

    await app.listen(PORT, HOST);

    const baseUrl = config.get<string>('APP_URL') || (await app.getUrl());
    const apiUrl = `${baseUrl}/${apiPrefix}`;

    const isProduction = nodeEnv === Environment.Production;

    const enableSwagger =
        !isProduction || config.get<boolean>('ENABLE_SWAGGER', false);
    const enableBullBoard =
        !isProduction || config.get<boolean>('ENABLE_BULLBOARD', false);

    const docsUrl = enableSwagger ? `${apiUrl}/${Routes.DOCS}` : null;
    const queuesUrl = enableBullBoard ? `${apiUrl}/${Routes.QUEUES}` : null;

    logger.log('='.repeat(50));
    logger.log(`🚀 Application started successfully`);
    logger.log(`📝 Environment: ${nodeEnv}`);
    logger.log(`🌐 Application URL: ${apiUrl}`);
    if (docsUrl) logger.log(`📚 Swagger Documentation: ${docsUrl}`);
    if (queuesUrl) logger.log(`📊 Queues Dashboard: ${queuesUrl}`);
    logger.log(`💾 Process ID: ${process.pid}`);
    logger.log('='.repeat(50));
}
