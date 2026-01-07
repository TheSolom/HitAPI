import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import type { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import type { EnvironmentVariablesDto } from '../config/env/dto/environment-variables.dto.js';

export function configureSwagger(
    app: NestExpressApplication,
    config: ConfigService<EnvironmentVariablesDto, true>,
    logger: Logger,
): void {
    const isProduction = config.get<string>('NODE_ENV') === 'production';
    const enableSwagger =
        !isProduction || config.get<boolean>('ENABLE_SWAGGER', false);

    if (!enableSwagger) {
        logger.warn('Swagger documentation is disabled');
        return;
    }

    const builder = new DocumentBuilder()
        .setTitle('HitAPI')
        .setDescription('The HitAPI REST API documentation')
        .setVersion('1.0.0')
        .setLicense('MIT', 'https://opensource.org/licenses/MIT')
        .addServer(
            `http://localhost:${config.get<number>('PORT', 3000)}`,
            'Local Development',
        )
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
                        tokenUrl: config.getOrThrow<string>('GOOGLE_TOKEN_URL'),
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

    const document = SwaggerModule.createDocument(app, builder);

    SwaggerModule.setup('docs', app, document, {
        useGlobalPrefix: true,
        jsonDocumentUrl: 'docs/json',
        yamlDocumentUrl: 'docs/yaml',
        swaggerOptions: {
            oauth2RedirectUrl: config.getOrThrow<string>('OAUTH2_REDIRECT_URL'),
            initOAuth: {
                clientId: config.getOrThrow<string>('GOOGLE_CLIENT_ID'),
                clientSecret: config.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
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
