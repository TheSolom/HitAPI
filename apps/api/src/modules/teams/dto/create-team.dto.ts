import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CreateTeamPayload } from '@hitapi/types';

export class CreateTeamDto implements CreateTeamPayload {
    @ApiProperty({ type: 'string' })
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: 'boolean', default: false })
    @IsBoolean()
    @IsOptional()
    demo?: boolean;

    @ApiPropertyOptional({ type: 'boolean', default: false })
    @IsBoolean()
    @IsOptional()
    stealth?: boolean;
}
