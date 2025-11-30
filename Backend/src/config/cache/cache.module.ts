import { Module } from '@nestjs/common';
import { redisConfiguration } from './redis/configuration.js';

@Module({ imports: [redisConfiguration] })
export class CacheModule {}
