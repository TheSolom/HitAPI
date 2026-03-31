import {
    Module,
    RequestMethod,
    type NestModule,
    type MiddlewareConsumer,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard } from '@nestjs/throttler';
import { validate } from './config/env/validation.js';
import { ThrottlerModule } from './config/throttler/throttler.module.js';
import { DBModule } from './config/db/database.module.js';
import { CacheModule } from './config/cache/cache.module.js';
import { QueueModule } from './config/queue/queue.module.js';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module.js';
import { ClsModule } from './config/cls/cls.module.js';
import { LoggerModule } from './modules/logger/logger.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MailsModule } from './modules/mails/mails.module.js';
import { MailerModule } from './modules/mailer/mailer.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { TeamsModule } from './modules/teams/teams.module.js';
import { AppsModule } from './modules/apps/apps.module.js';
import { EndpointsModule } from './modules/endpoints/endpoints.module.js';
import { ConsumersModule } from './modules/consumers/consumers.module.js';
import { GeoIPModule } from './modules/geo-ip/geo-ip.module.js';
import { RequestLogsModule } from './modules/request-logs/request-logs.module.js';
import { ErrorsModule } from './modules/errors/errors.module.js';
import { TrafficModule } from './modules/traffic/traffic.module.js';
import { ResourcesModule } from './modules/resources/resources.module.js';
import { IngestionModule } from './modules/ingestion/ingestion.module.js';
import { ClsSeedingMiddleware } from './common/middlewares/cls-seeding.middleware.js';
import { NdjsonBodyMiddleware } from './common/middlewares/ndjson-body.middleware.js';
import { Routes } from './common/constants/routes.constant.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env${process.env.NODE_ENV === 'production' ? '' : '.local'}`,
            isGlobal: true,
            cache: true,
            validate,
        }),
        ScheduleModule.forRoot(),
        ThrottlerModule,
        DBModule,
        CacheModule,
        QueueModule,
        RateLimitModule,
        ClsModule,
        LoggerModule,
        UsersModule,
        MailsModule,
        MailerModule,
        AuthModule,
        TeamsModule,
        AppsModule,
        EndpointsModule,
        ConsumersModule,
        GeoIPModule,
        RequestLogsModule,
        ErrorsModule,
        TrafficModule,
        ResourcesModule,
        IngestionModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(ClsSeedingMiddleware).forRoutes('{*splat}');
        consumer.apply(NdjsonBodyMiddleware).forRoutes({
            path: `${Routes.INGESTION}/logs`,
            method: RequestMethod.POST,
            version: '1',
        });
    }
}
