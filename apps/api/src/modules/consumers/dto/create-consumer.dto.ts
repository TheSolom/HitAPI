import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateConsumerDto {
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
