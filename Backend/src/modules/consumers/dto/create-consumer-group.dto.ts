import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsInt,
} from 'class-validator';

export class CreateConsumerGroupDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: 'integer', isArray: true })
    @IsInt({ each: true })
    @IsArray()
    @IsOptional()
    consumerIds?: number[];
}
