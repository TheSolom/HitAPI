import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';

export const redisConfiguration: DynamicModule = CacheModule.registerAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => {
        return {
            stores: [
                new KeyvRedis(
                    `redis://${configService.getOrThrow<string>('REDIS_HOST')}:${configService.getOrThrow<number>('REDIS_PORT')}`,
                ),
            ],
            ttl: 0, // 0 means use the TTL provided on each set() call
        };
    },
    inject: [ConfigService],
    isGlobal: true,
});
