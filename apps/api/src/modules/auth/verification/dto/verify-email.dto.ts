import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    token: string;
}
