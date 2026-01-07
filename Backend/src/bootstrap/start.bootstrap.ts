import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Logger } from '@nestjs/common';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export async function startApp(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): Promise<void> {
    const PORT = config.get<number>('PORT', 3000);
    const HOST = config.get<string>('HOST', '0.0.0.0');
    const apiPrefix = config.get<string>('API_PREFIX', 'api');

    await app.listen(PORT, HOST);

    const appUrl = await app.getUrl();
    const apiUrl = `${appUrl}/${apiPrefix}`;
    const docsUrl = `${appUrl}/${apiPrefix}/docs`;

    logger.log('='.repeat(50));
    logger.log(`🚀 Application started successfully`);
    logger.log(
        `📝 Environment: ${config.get<string>('NODE_ENV') || 'Development'}`,
    );
    logger.log(`🌐 Application URL: ${apiUrl}`);
    logger.log(`📚 Swagger Documentation: ${docsUrl}`);
    logger.log(`💾 Process ID: ${process.pid}`);
    logger.log('='.repeat(50));
}
