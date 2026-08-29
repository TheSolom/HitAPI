import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ConsumerGroupResponseDto as IConsumerGroupResponseDto } from '@hitapi/types';

export class ConsumerGroupResponseDto implements IConsumerGroupResponseDto {
    @Expose()
    @ApiProperty({ type: 'integer' })
    id: number;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;

    @Expose()
    @ApiPropertyOptional({ type: 'integer' })
    consumerCount?: number;
}
