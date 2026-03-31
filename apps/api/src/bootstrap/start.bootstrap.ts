import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import type { AppLoggerService } from '../modules/logger/logger.service.js';
import { Routes } from '../common/constants/routes.constant.js';
import { Environment } from '../common/enums/environment.enum.js';

export async function startApp(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): Promise<void> {
    const PORT = config.get<number>('PORT', 3000);
    const HOST = config.get<string>('HOST', '0.0.0.0');
    const apiPrefix = config.get<string>('API_PREFIX', 'api');

    await app.listen(PORT, HOST);

    const appUrl = await app.getUrl();
    const apiUrl = `${appUrl}/${apiPrefix}`;

    let docsUrl: string | null = null;
    const enableSwagger =
        config.get<Environment>('NODE_ENV') !== Environment.Production ||
        config.get<boolean>('ENABLE_SWAGGER', false);
    if (enableSwagger) {
        docsUrl = `${appUrl}/${apiPrefix}/${Routes.DOCS}`;
    }

    let queuesUrl: string | null = null;
    const enableBullBoard = config.get<boolean>('ENABLE_BULLBOARD', true);
    if (enableBullBoard) {
        queuesUrl = `${appUrl}/${apiPrefix}/${Routes.QUEUES}`;
    }

    logger.log('='.repeat(50));
    logger.log(`🚀 Application started successfully`);
    logger.log(`📝 Environment: ${config.get<Environment>('NODE_ENV')}`);
    logger.log(`🌐 Application URL: ${apiUrl}`);
    if (enableSwagger) logger.log(`📚 Swagger Documentation: ${docsUrl}`);
    if (enableBullBoard) logger.log(`📊 Queues: ${queuesUrl}`);
    logger.log(`💾 Process ID: ${process.pid}`);
    logger.log('='.repeat(50));
}
