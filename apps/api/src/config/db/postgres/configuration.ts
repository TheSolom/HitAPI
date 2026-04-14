import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';
import { Environment } from '../../../common/enums/environment.enum.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const postgresConfiguration: DynamicModule = TypeOrmModule.forRootAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => {
        const isProduction =
            configService.getOrThrow<Environment>('NODE_ENV') ===
            Environment.Production;

        return {
            type: 'postgres',
            host: configService.getOrThrow<string>('POSTGRES_HOST'),
            port: configService.getOrThrow<number>('POSTGRES_PORT'),
            username: configService.getOrThrow<string>('POSTGRES_USER'),
            password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
            database: configService.getOrThrow<string>('POSTGRES_DB'),
            ssl: configService.get<boolean>('POSTGRES_SSL')
                ? { rejectUnauthorized: false }
                : false,
            autoLoadEntities: true,
            synchronize: !isProduction,
            migrations: isProduction
                ? [path.join(__dirname, 'migrations', '*.js')]
                : [],
            migrationsRun: isProduction,
        };
    },
    inject: [ConfigService],
});
