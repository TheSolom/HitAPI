import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';

export const postgresConfiguration: DynamicModule = TypeOrmModule.forRootAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: configService.getOrThrow<number>('POSTGRES_PORT'),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        synchronize:
            configService.getOrThrow<string>('NODE_ENV') !== 'production',
    }),
    inject: [ConfigService],
});
