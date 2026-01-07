import { JwtModule } from '@nestjs/jwt';
import { DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariablesDto } from '../../config/env/dto/environment-variables.dto.js';

export const jwtConfiguration: DynamicModule = JwtModule.registerAsync({
    useFactory: (
        configService: ConfigService<EnvironmentVariablesDto, true>,
    ) => ({
        secret: configService.getOrThrow<string>('ACCESS_TOKEN_SECRET'),
        signOptions: {
            expiresIn: configService.getOrThrow<number>(
                'ACCESS_TOKEN_EXPIRATION_TIME',
            ),
        },
    }),
    inject: [ConfigService],
    global: true,
});
