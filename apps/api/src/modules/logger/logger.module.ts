import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { INQUIRER } from '@nestjs/core';
import {
    WinstonModule,
    utilities as nestWinstonModuleUtilities,
    WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { ClsService } from 'nestjs-cls';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';
import { Environment } from '../../common/enums/environment.enum.js';
import { AppLoggerService } from './logger.service.js';
import type { AppClsStore } from './interfaces/logger.interface.js';

@Global()
@Module({
    imports: [
        WinstonModule.forRootAsync({
            useFactory: (
                config: ConfigService<EnvironmentVariablesDto, true>,
            ) => {
                const isProduction =
                    config.getOrThrow<Environment>('NODE_ENV') ===
                    Environment.Production;

                const transports: winston.transport[] = [];

                if (isProduction) {
                    transports.push(
                        new winston.transports.Console({
                            stderrLevels: ['error', 'fatal'],
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.json(),
                            ),
                        }),
                        new winston.transports.DailyRotateFile({
                            filename: 'logs/error-%DATE%.log',
                            datePattern: 'YYYY-MM-DD',
                            zippedArchive: true,
                            maxSize: '20m',
                            maxFiles: '14d',
                            level: 'error',
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.json(),
                            ),
                        }),
                        new winston.transports.DailyRotateFile({
                            filename: 'logs/app-%DATE%.log',
                            datePattern: 'YYYY-MM-DD',
                            zippedArchive: true,
                            maxSize: '20m',
                            maxFiles: '14d',
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.json(),
                            ),
                        }),
                    );
                } else {
                    transports.push(
                        new winston.transports.Console({
                            format: winston.format.combine(
                                winston.format.timestamp(),
                                winston.format.ms(),
                                nestWinstonModuleUtilities.format.nestLike(
                                    'HitAPI',
                                    {
                                        colors: true,
                                        prettyPrint: true,
                                    },
                                ),
                            ),
                        }),
                    );
                }

                return {
                    level: isProduction ? 'info' : 'debug',
                    transports,
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [
        {
            provide: AppLoggerService,
            useFactory: (
                inquirer: object,
                logger: winston.Logger,
                cls: ClsService<AppClsStore>,
            ) => new AppLoggerService(inquirer, logger, cls),
            inject: [INQUIRER, WINSTON_MODULE_PROVIDER, ClsService],
            scope: Scope.TRANSIENT,
        },
    ],
    exports: [AppLoggerService],
})
export class LoggerModule {}
