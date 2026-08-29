import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ConsumerStatus } from '../enums/consumer-status.enum.js';
import type { ConsumersChartResponseDto as IConsumersChartResponseDto } from '@hitapi/types';

export class ConsumersChartResponseDto implements IConsumersChartResponseDto {
    @ApiPropertyOptional({ enum: ConsumerStatus })
    consumer_status?: ConsumerStatus;

    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    consumerCounts: number[];
}
