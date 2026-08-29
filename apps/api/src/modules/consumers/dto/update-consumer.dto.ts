import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';
import type { UpdateConsumerPayload } from '@hitapi/types';

export class UpdateConsumerDto implements UpdateConsumerPayload {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: 'integer' })
    @IsInt()
    @IsOptional()
    consumerGroupId?: number | null;
}
