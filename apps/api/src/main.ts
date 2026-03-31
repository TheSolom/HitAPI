import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from './config/env/dto/environment-variables.dto.js';
import { AppModule } from './app.module.js';
import { AppLoggerService } from './modules/logger/logger.service.js';
import { configureApp } from './bootstrap/app.bootstrap.js';
import { configureSwagger } from './bootstrap/swagger.bootstrap.js';
import { configureGracefulShutdown } from './bootstrap/shutdown.bootstrap.js';
import { startApp } from './bootstrap/start.bootstrap.js';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bodyParser: false,
        rawBody: true,
        bufferLogs: true,
    });

    app.useBodyParser('json', { type: ['application/json'] });
    app.useBodyParser('raw', { type: ['application/x-ndjson'] });
    app.useBodyParser('urlencoded', {
        type: ['application/x-www-form-urlencoded'],
    });

    const configService =
        app.get<ConfigService<EnvironmentVariablesDto, true>>(ConfigService);

    const logger = await app.resolve(AppLoggerService);
    logger.setContext('Bootstrap');
    app.useLogger(logger);

    await configureApp(app, configService, logger);
    configureSwagger(app, configService, logger);
    configureGracefulShutdown(app, logger);

    await startApp(app, configService, logger);
}

await bootstrap();
