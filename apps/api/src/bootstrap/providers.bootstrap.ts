import {
    ClassSerializerInterceptor,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import { AppLoggerService } from '../modules/logger/logger.service.js';
import { HttpLoggerInterceptor } from '../common/interceptors/http-logger.interceptor.js';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { Environment } from '../common/enums/environment.enum.js';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter.js';
import { PostgresExceptionFilter } from '../common/filters/database-exception.filter.js';

export async function configureGlobalProviders(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: AppLoggerService,
): Promise<void> {
    const reflector = app.get(Reflector);

    app.useGlobalInterceptors(
        new HttpLoggerInterceptor(logger, app.get(ClsService)),
        new ResponseInterceptor(reflector),
        new ClassSerializerInterceptor(reflector, {
            excludeExtraneousValues: true,
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            enableDebugMessages:
                config.get<Environment>('NODE_ENV') === Environment.Development,
            exceptionFactory: (errors) => new BadRequestException(errors),
        }),
    );

    app.useGlobalFilters(
        new GlobalExceptionFilter(
            await app.resolve(AppLoggerService),
            app.get(ClsService),
            config,
        ),
        new PostgresExceptionFilter(
            await app.resolve(AppLoggerService),
            app.get(ClsService),
            config,
        ),
    );

    logger.log('Global providers configured');
}
