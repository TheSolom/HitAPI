import { createLogger, format, transports, type Logger } from 'winston';

export function getLogger(): Logger {
    return createLogger({
        level: 'warn',
        format: format.combine(
            format.colorize(),
            format.timestamp(),
            format.printf(
                (info) =>
                    `${String(info.timestamp)} ${info.level}: ${String(info.message)}`,
            ),
        ),
        transports: [new transports.Console()],
    });
}
