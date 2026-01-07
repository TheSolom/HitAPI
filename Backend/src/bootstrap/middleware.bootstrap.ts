import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export function configureMiddleware(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    const isProduction = config.get<string>('NODE_ENV') === 'production';

    app.use(cookieParser());
    app.use(morgan(isProduction ? 'combined' : 'dev'));
    app.use(
        compression({
            filter: (req, res) => {
                if (req.headers['x-no-compression']) {
                    return false;
                }
                return compression.filter(req, res);
            },
            level: 6,
        }),
    );

    logger.log('Middleware configured');
}
