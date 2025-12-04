import { Module } from '@nestjs/common';
import { jwtConfiguration } from './configuration.js';

@Module({ imports: [jwtConfiguration] })
export class JwtModule {}
