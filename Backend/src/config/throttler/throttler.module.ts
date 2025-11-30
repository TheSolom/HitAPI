import { Module } from '@nestjs/common';
import { throttlerConfiguration } from './configuration.js';

@Module({
    imports: [throttlerConfiguration],
})
export class ThrottlerModule {}
