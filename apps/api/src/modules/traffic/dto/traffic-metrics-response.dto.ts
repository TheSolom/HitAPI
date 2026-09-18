import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TrafficMetricsResponseDto as ITrafficMetricsResponseDto } from '@hitapi/types';

export class TrafficMetricsResponseDto implements ITrafficMetricsResponseDto {
    @ApiProperty({ type: 'integer' })
    totalRequestCount: number;

    @ApiProperty({ type: 'number' })
    requestsPerMinute: number;

    @ApiProperty({ type: 'integer' })
    clientErrorCount: number;

    @ApiProperty({ type: 'integer' })
    serverErrorCount: number;

    @ApiProperty({ type: 'number' })
    errorRate: number;

    @ApiProperty({ type: 'integer' })
    requestSizeSum: number;

    @ApiPropertyOptional({ type: 'number' })
    requestSizeAvg?: number;

    @ApiProperty({ type: 'integer' })
    responseSizeSum: number;

    @ApiPropertyOptional({ type: 'number' })
    responseSizeAvg?: number;

    @ApiProperty({ type: 'number' })
    totalDataTransferred: number;

    @ApiProperty({ type: 'integer' })
    uniqueConsumerCount: number;
}
