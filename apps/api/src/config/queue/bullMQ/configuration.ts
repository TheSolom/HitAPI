import { BullModule } from '@nestjs/bullmq';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../../env/dto/environment-variables.dto.js';

export const bullMQConfiguration: DynamicModule = BullModule.forRootAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => ({
        connection: { url: configService.getOrThrow<string>('REDIS_URL') },
    }),
    inject: [ConfigService],
});
