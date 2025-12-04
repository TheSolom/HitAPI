import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class RefreshTokenDto {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    refreshToken: string;
}
