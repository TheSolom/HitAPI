import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LogoutDto {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    refreshToken: string;
}
