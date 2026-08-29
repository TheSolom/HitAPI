import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import type { CreateConsumerPayload } from '@hitapi/types';

export class CreateConsumerDto implements CreateConsumerPayload {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: 'integer' })
    @IsInt()
    @IsOptional()
    groupId?: number;

    @ApiPropertyOptional({ type: 'boolean' })
    @IsBoolean()
    @IsOptional()
    hidden?: boolean;
}
