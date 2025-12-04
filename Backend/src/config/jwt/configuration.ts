import { JwtModule } from '@nestjs/jwt';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Environment } from '../../common/interfaces/env.interface.js';

export const jwtConfiguration: DynamicModule = JwtModule.registerAsync({
    useFactory: (configService: ConfigService<Environment, true>) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
            expiresIn: Number.parseInt(
                configService.getOrThrow<string>(
                    'ACCESS_TOKEN_EXPIRATION_TIME',
                ),
            ),
        },
    }),
    inject: [ConfigService],
    global: true,
});
