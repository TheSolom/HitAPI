import { BullModule } from '@nestjs/bullmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../../env/dto/environment-variables.dto.js';

export const bullMQConfiguration: DynamicModule = BullModule.forRootAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => ({
        connection: {
            host: configService.getOrThrow<string>('REDIS_HOST'),
            port: configService.getOrThrow<number>('REDIS_PORT'),
            username: configService.getOrThrow<string>('REDIS_USER'),
            password: configService.getOrThrow<string>('REDIS_PASSWORD'),
        },
    }),
    inject: [ConfigService],
});
