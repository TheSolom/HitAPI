import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import type { EnvironmentVariablesDto } from './config/env/dto/environment-variables.dto.js';
import { AppModule } from './app.module.js';
import { configureApp } from './bootstrap/app.bootstrap.js';
import { configureSwagger } from './bootstrap/swagger.bootstrap.js';
import { configureGracefulShutdown } from './bootstrap/shutdown.bootstrap.js';
import { startApp } from './bootstrap/start.bootstrap.js';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService =
        app.get<ConfigService<EnvironmentVariablesDto, true>>(ConfigService);
    const logger = new Logger('Bootstrap');

    configureApp(app, configService, logger);
    configureSwagger(app, configService, logger);
    configureGracefulShutdown(app, logger);

    await startApp(app, configService, logger);
}

await bootstrap();
