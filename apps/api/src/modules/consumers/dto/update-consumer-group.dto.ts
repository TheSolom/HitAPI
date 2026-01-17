import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsInt,
} from 'class-validator';

export class UpdateConsumerGroupDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: 'number', isArray: true })
    @IsInt({ each: true })
    @IsArray()
    @IsOptional()
    consumerIds?: number[] | null;
}
