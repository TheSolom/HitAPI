import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsumerGroupResponseDto } from '../../consumers/dto/consumer-group-response.dto.js';
import type { TrafficConsumersTableResponseDto as ITrafficConsumersTableResponseDto } from '@hitapi/types';

export class TrafficConsumersTableResponseDto implements ITrafficConsumersTableResponseDto {
    @ApiProperty({ type: 'integer' })
    id: number;

    @ApiProperty({ type: 'string' })
    identifier: string;

    @ApiProperty({ type: 'string' })
    name: string;

    @ApiPropertyOptional({ type: () => ConsumerGroupResponseDto })
    group?: ConsumerGroupResponseDto;

    @ApiProperty({ type: 'integer' })
    requests: number;

    @ApiProperty({ type: 'number' })
    errorRate: number;

    @ApiProperty({ type: 'string', format: 'date-time' })
    firstRequestAt: string;

    @ApiProperty({ type: 'string', format: 'date-time' })
    lastRequestAt: string;

    @ApiProperty({ type: 'boolean' })
    isNew: boolean;
}
