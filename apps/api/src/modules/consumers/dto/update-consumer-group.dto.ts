import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsArray,
    IsInt,
} from 'class-validator';
import type { UpdateConsumerGroupPayload } from '@hitapi/types';

export class UpdateConsumerGroupDto implements UpdateConsumerGroupPayload {
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
