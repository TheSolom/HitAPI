import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import type { LogoutPayload } from '@hitapi/types';

export class LogoutDto implements LogoutPayload {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    refreshToken: string;
}
