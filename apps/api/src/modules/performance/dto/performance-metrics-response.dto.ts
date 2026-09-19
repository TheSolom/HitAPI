import { ApiProperty } from '@nestjs/swagger';
import type { PerformanceMetricsResponseDto as IPerformanceMetricsResponseDto } from '@hitapi/types';

export class PerformanceMetricsResponseDto implements IPerformanceMetricsResponseDto {
    @ApiProperty({ type: 'integer' })
    totalRequestCount: number;

    @ApiProperty({ type: 'integer' })
    responseTimeP50: number;

    @ApiProperty({ type: 'integer' })
    responseTimeP75: number;

    @ApiProperty({ type: 'integer' })
    responseTimeP95: number;

    @ApiProperty({ type: 'integer' })
    apdexSatisfiedCount: number;

    @ApiProperty({ type: 'integer' })
    apdexToleratedCount: number;

    @ApiProperty({ type: 'integer' })
    apdexFrustratedCount: number;

    @ApiProperty({ type: 'number' })
    apdexScore: number;

    @ApiProperty({ type: 'integer' })
    targetResponseTimeMs: number;
}
