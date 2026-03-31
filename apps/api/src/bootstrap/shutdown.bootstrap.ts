import type { NestExpressApplication } from '@nestjs/platform-express';
import type { AppLoggerService } from '../modules/logger/logger.service.js';

export function configureGracefulShutdown(
    app: NestExpressApplication,
    logger: AppLoggerService,
): void {
    app.enableShutdownHooks();

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', { promise, reason });
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', { error });
        process.exit(1);
    });
}
