import type { NestExpressApplication } from '@nestjs/platform-express';
import type { ConfigService } from '@nestjs/config';
import type { Logger } from '@nestjs/common';
import helmet from 'helmet';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';
import { Environment } from '../common/enums/environment.enum.js';

export function configureSecurity(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    const isProduction =
        config.get<Environment>('NODE_ENV') === Environment.Production;

    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
            contentSecurityPolicy: isProduction
                ? {
                      directives: {
                          defaultSrc: [`'self'`],
                          styleSrc: [`'self'`, `'unsafe-inline'`],
                          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
                          imgSrc: [
                              `'self'`,
                              'data:',
                              'https:',
                              'validator.swagger.io',
                          ],
                      },
                  }
                : false,
            hsts: isProduction
                ? {
                      maxAge: 31536000,
                      includeSubDomains: true,
                      preload: true,
                  }
                : false,
        }),
    );

    app.disable('x-powered-by');

    if (isProduction) {
        app.set('trust proxy', 1);
    }

    logger.log('Security configured');
}
