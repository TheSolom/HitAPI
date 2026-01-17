import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AuthProvidersEnum } from '../../enums/auth-providers.enum.js';

export class SocialAccountDto {
    @Expose()
    @ApiProperty({ enum: AuthProvidersEnum })
    provider: AuthProvidersEnum;

    @Expose()
    @ApiProperty({ type: 'string' })
    socialId: string;

    @Expose()
    @ApiProperty({ format: 'email' })
    email: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    displayName: string;

    @Expose()
    @ApiProperty({ type: Date })
    createdAt: Date;
}
