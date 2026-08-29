import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsInt,
} from 'class-validator';
import type { CreateConsumerGroupPayload } from '@hitapi/types';

export class CreateConsumerGroupDto implements CreateConsumerGroupPayload {
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
