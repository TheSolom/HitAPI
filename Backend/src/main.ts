import {
    ClassSerializerInterceptor,
    ValidationPipe,
    VersioningType,
    Logger,
} from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import helmet from 'helmet';
import type { Environment } from './common/interfaces/env.interface.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { PostgresExceptionFilter } from './common/filters/database-exception.filter.js';
import { AppModule } from './app.module.js';

const logger = new Logger('Bootstrap');
const configService = new ConfigService<Environment, true>();
const IS_PRODUCTION =
    configService.getOrThrow<string>('NODE_ENV') === 'production';

function configureCors(app: NestExpressApplication): void {
    if (IS_PRODUCTION) {
        const allowedOrigin = configService.getOrThrow<string>('FRONTEND_URL');

        app.enableCors({
            origin: (origin, callback) => {
                if (!origin || allowedOrigin === origin) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: [
                'Authorization',
                'Content-Type',
                'Accept',
                'X-Requested-With',
            ],
            exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
            credentials: true,
            maxAge: 3600,
        });
        logger.log(`CORS enabled for origin: ${allowedOrigin}`);
    } else {
        app.enableCors();
        logger.warn('CORS enabled for all origins (development mode)');
    }
}

function configureApiSettings(app: NestExpressApplication): void {
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix, {
        exclude: ['health', 'metrics'],
    });

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
        prefix: 'v',
    });

    logger.log(`API prefix set to: /${apiPrefix}`);
}

function configureGlobalProviders(app: NestExpressApplication): void {
    const reflector = app.get(Reflector);

    app.useGlobalInterceptors(
        new ResponseInterceptor(reflector),
        new ClassSerializerInterceptor(reflector, {
            excludeExtraneousValues: true,
        }),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            stopAtFirstError: true,
            enableDebugMessages: !IS_PRODUCTION,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    app.useGlobalFilters(new PostgresExceptionFilter());

    logger.log('Global providers configured');
}

function configureMiddleware(app: NestExpressApplication): void {
    app.use(cookieParser());
    app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));
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

function configureSecurity(app: NestExpressApplication): void {
    app.use(
        helmet({
            crossOriginResourcePolicy: { policy: 'cross-origin' },
            contentSecurityPolicy: IS_PRODUCTION
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
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true,
            },
        }),
    );

    app.disable('x-powered-by');
    if (IS_PRODUCTION) app.set('trust proxy', 1);

    logger.log('Security configured');
}

function configureExpressSettings(app: NestExpressApplication): void {
    app.set('query parser', 'extended');
    app.set('json spaces', 2);
    app.set('etag', 'strong');

    app.useBodyParser('json', { limit: '10mb' });
    app.useBodyParser('urlencoded', { extended: true, limit: '10mb' });
}

function configureApp(app: NestExpressApplication): void {
    configureCors(app);
    configureApiSettings(app);
    configureGlobalProviders(app);
    configureMiddleware(app);
    configureSecurity(app);
    configureExpressSettings(app);
}

function configureSwagger(app: NestExpressApplication): void {
    const enableSwagger =
        !IS_PRODUCTION || configService.get<boolean>('ENABLE_SWAGGER', false);

    if (!enableSwagger) {
        logger.warn('Swagger documentation is disabled');
        return;
    }

    const config = new DocumentBuilder()
        .setTitle('HitAPI')
        .setDescription('The HitAPI REST API documentation')
        .setVersion('1.0.0')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer(
            `http://localhost:${configService.get<number>('PORT', 3000)}`,
            'Local Development',
        )
        .addServer('https://api.hitapi.example.com', 'Production')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT',
        )
        .addOAuth2(
            {
                type: 'oauth2',
                flows: {
                    authorizationCode: {
                        authorizationUrl:
                            'https://accounts.google.com/o/oauth2/v2/auth',
                        tokenUrl:
                            configService.getOrThrow<string>(
                                'GOOGLE_TOKEN_URL',
                            ),
                        scopes: {
                            email: 'Access to email address',
                            profile: 'Access to basic profile information',
                        },
                    },
                },
            },
            'GoogleOAuth2',
        )
        .build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('docs', app, document, {
        useGlobalPrefix: true,
        jsonDocumentUrl: 'docs/json',
        yamlDocumentUrl: 'docs/yaml',
        swaggerOptions: {
            oauth2RedirectUrl: configService.getOrThrow<string>(
                'OAUTH2_REDIRECT_URL',
            ),
            initOAuth: {
                clientId: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
                clientSecret: configService.getOrThrow<string>(
                    'GOOGLE_CLIENT_SECRET',
                ),
                scopes: ['email', 'profile'],
                usePkceWithAuthorizationCodeGrant: false,
            },
            persistAuthorization: true,
            filter: true,
            showRequestDuration: true,
            docExpansion: 'none',
            syntaxHighlight: { activate: true, theme: 'monokai' },
        },
        customSiteTitle: 'HitAPI Documentation',
        customCss: '.swagger-ui .topbar { display: none }',
    });

    logger.log('Swagger documentation configured');
}

function configureGracefulShutdown(app: NestExpressApplication): void {
    app.enableShutdownHooks();

    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];

    signals.forEach((signal) => {
        process.on(signal, (async (): Promise<void> => {
            logger.log(`Received ${signal}, closing application gracefully...`);
            try {
                await app.close();
                logger.log('Application closed successfully');
                process.exit(0);
            } catch (error) {
                logger.error('Error during shutdown', error);
                process.exit(1);
            }
        }) as NodeJS.SignalsListener);
    });

    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    });

    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception:', error);
        process.exit(1);
    });
}

async function startApp(app: NestExpressApplication): Promise<void> {
    const PORT = configService.get<number>('PORT', 3000);
    const HOST = configService.get<string>('HOST', '0.0.0.0');
    const apiPrefix = configService.get<string>('API_PREFIX', 'api');

    await app.listen(PORT, HOST);

    const appUrl = await app.getUrl();
    const apiUrl = `${appUrl}/${apiPrefix}`;
    const docsUrl = `${appUrl}/${apiPrefix}/docs`;

    logger.log('='.repeat(50));
    logger.log(`🚀 Application started successfully`);
    logger.log(
        `📝 Environment: ${IS_PRODUCTION ? 'Production' : 'Development'}`,
    );
    logger.log(`🌐 Application URL: ${apiUrl}`);
    logger.log(`📚 Swagger Documentation: ${docsUrl}`);
    logger.log(`💾 Process ID: ${process.pid}`);
    logger.log('='.repeat(50));
}

async function bootstrap(): Promise<void> {
    try {
        const app = await NestFactory.create<NestExpressApplication>(
            AppModule,
            {
                logger: IS_PRODUCTION
                    ? ['error', 'warn', 'log']
                    : ['error', 'warn', 'log', 'debug', 'verbose'],
                bufferLogs: true,
                abortOnError: false,
            },
        );

        configureApp(app);
        configureSwagger(app);
        configureGracefulShutdown(app);
        await startApp(app);
    } catch (error) {
        logger.error('Failed to start application', error);
        process.exit(1);
    }
}

await bootstrap();
