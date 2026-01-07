import {
    Logger,
    ClassSerializerInterceptor,
    ValidationPipe,
    BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ResponseInterceptor } from '../common/interceptors/response.interceptor.js';
import { GlobalExceptionFilter } from '../common/filters/global-exception.filter.js';
import { PostgresExceptionFilter } from '../common/filters/database-exception.filter.js';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export function configureGlobalProviders(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    const reflector = app.get(Reflector);
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    app.useGlobalInterceptors(
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
            enableDebugMessages: !isProduction,
            exceptionFactory: (errors) => new BadRequestException(errors),
        }),
    );

    app.useGlobalFilters(
        new GlobalExceptionFilter(),
        new PostgresExceptionFilter(),
    );

    logger.log('Global providers configured');
}
