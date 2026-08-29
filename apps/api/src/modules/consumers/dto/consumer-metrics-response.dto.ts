import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ConsumerMetricsResponseDto as IConsumerMetricsResponseDto } from '@hitapi/types';

export class ConsumerMetricsResponseDto implements IConsumerMetricsResponseDto {
    @Expose()
    @ApiProperty({
        type: 'integer',
        description: 'Total number of consumers for the application',
    })
    totalConsumers: number;

    @Expose()
    @ApiProperty({
        type: 'integer',
        description: 'Number of new consumers created in the specified period',
    })
    newConsumers: number;
}
