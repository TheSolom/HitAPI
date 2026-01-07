import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function handleShutdown(
    signal: string,
    app: NestExpressApplication,
    logger: Logger,
): Promise<void> {
    logger.log(`Received ${signal}, closing application gracefully...`);

    try {
        await app.close();
        logger.log('Application closed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Error during shutdown', error);
        process.exit(1);
    }
}

export function configureGracefulShutdown(
    app: NestExpressApplication,
    logger: Logger,
): void {
    app.enableShutdownHooks();

    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    for (const signal of signals) {
        process.on(signal, () => void handleShutdown(signal, app, logger));
    }

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
}
