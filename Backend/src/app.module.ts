import { Module } from '@nestjs/common';
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
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
