import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import type { AppLoggerService } from '../modules/logger/logger.service.js';

export function configureMiddleware(
    app: NestExpressApplication,
    logger: AppLoggerService,
): void {
    app.use(cookieParser());
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
