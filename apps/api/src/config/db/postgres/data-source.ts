import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Environment } from '@hitapi/types';
import type { EnvironmentVariablesDto } from '../../../config/env/dto/environment-variables.dto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appRoot = path.resolve(__dirname, '../../../../');
const nodeEnv = process.env.NODE_ENV || Environment.Development;
const candidateEnvFiles = [
    `.env.${nodeEnv}.local`,
    `.env.${nodeEnv}`,
    '.env.local',
    '.env',
];

for (const envFile of candidateEnvFiles) {
    const fullPath = path.join(appRoot, envFile);
    if (fs.existsSync(fullPath)) {
        dotenv.config({ path: fullPath });
    }
}

const configService = new ConfigService<EnvironmentVariablesDto, false>();

export default new DataSource({
    type: 'postgres',
    host: configService.getOrThrow<string>('POSTGRES_HOST'),
    port: configService.getOrThrow<number>('POSTGRES_PORT'),
    username: configService.getOrThrow<string>('POSTGRES_USER'),
    password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
    database: configService.getOrThrow<string>('POSTGRES_DB'),
    ssl: configService.get<boolean>('POSTGRES_SSL')
        ? { rejectUnauthorized: false }
        : false,
    entities: [
        path.join(__dirname, '..', '..', '..', '..', '**', '*.entity.js'),
    ],
    migrations: [path.join(__dirname, 'migrations', '*.js')],
});
