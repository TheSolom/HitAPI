import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { RefreshTokenPayload } from '@hitapi/types';

export class RefreshTokenDto implements RefreshTokenPayload {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    refreshToken: string;
}
