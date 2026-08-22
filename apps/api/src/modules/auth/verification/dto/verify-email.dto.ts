import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import type { VerifyEmailPayload } from '@hitapi/types';

export class VerifyEmailDto implements VerifyEmailPayload {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    token: string;
}
