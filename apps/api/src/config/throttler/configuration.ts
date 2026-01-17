import { DynamicModule } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

export const throttlerConfiguration: DynamicModule =
    ThrottlerModule.forRootAsync({
        useFactory: () => ({
            throttlers: [
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 3,
                },
                {
                    name: 'medium',
                    ttl: 10000,
                    limit: 20,
                },
                {
                    name: 'long',
                    ttl: 60000,
                    limit: 100,
                },
            ],
        }),
    });
