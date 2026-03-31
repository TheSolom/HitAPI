import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';

export const redisConfiguration: DynamicModule = CacheModule.registerAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => {
        const redisUrl = `redis://${configService.getOrThrow<string>('REDIS_USER')}:${configService.getOrThrow<string>('REDIS_PASSWORD')}@${configService.getOrThrow<string>('REDIS_HOST')}:${configService.getOrThrow<number>('REDIS_PORT')}/${configService.getOrThrow<number>('REDIS_DATABASE')}`;

        return {
            stores: [
                new KeyvRedis(redisUrl, {
                    namespace: configService.getOrThrow<string>('APP_NAME'),
                }),
            ],
            ttl: 0, // 0 means use the TTL provided on each set() call
        };
    },
    inject: [ConfigService],
    isGlobal: true,
});
