import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import type { LogoutPayload } from '@hitapi/types';

export class LogoutDto implements LogoutPayload {
    @ApiPropertyOptional({ type: 'string' })
    @IsOptional()
    @IsString()
    refreshToken?: string;
}
