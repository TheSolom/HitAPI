import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from './config/throttler/throttler.module.js';
import { DBModule } from './config/db/database.module.js';
import { CacheModule } from './config/cache/cache.module.js';
import { RateLimitModule } from './modules/rate-limit/rate-limit.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { MailsModule } from './modules/mails/mails.module.js';
import { MailerModule } from './modules/mailer/mailer.module.js';
import { AuthModule } from './modules/auth/auth.module.js';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: '.env.local', // Local development environment variables
            isGlobal: true,
            cache: true,
        }),
        ThrottlerModule,
        DBModule,
        CacheModule,
        RateLimitModule,
        UsersModule,
        MailsModule,
        MailerModule,
        AuthModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
