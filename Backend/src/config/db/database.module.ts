import { Module } from '@nestjs/common';
import { postgresConfiguration } from './postgres/configuration.js';

@Module({ imports: [postgresConfiguration] })
export class DBModule {}
