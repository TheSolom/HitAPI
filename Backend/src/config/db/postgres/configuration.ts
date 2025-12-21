import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../../../common/interfaces/env.interface.js';

export const postgresConfiguration: DynamicModule = TypeOrmModule.forRootAsync({
    useFactory: (configService: ConfigService<Environment, true>) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('POSTGRES_HOST'),
        port: Number.parseInt(
            configService.getOrThrow<string>('POSTGRES_PORT'),
        ),
        username: configService.getOrThrow<string>('POSTGRES_USER'),
        password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
        database: configService.getOrThrow<string>('POSTGRES_DATABASE'),
        autoLoadEntities: true,
        synchronize:
            configService.getOrThrow<string>('NODE_ENV') !== 'production',
    }),
    inject: [ConfigService],
});
