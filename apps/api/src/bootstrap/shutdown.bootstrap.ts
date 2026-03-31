import type { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

export function configureGracefulShutdown(
    app: NestExpressApplication,
    logger: Logger,
): void {
    app.enableShutdownHooks();

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
}
