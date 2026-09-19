import { ApiProperty } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { PerformanceEndpointsTableResponseDto as IPerformanceEndpointsTableResponseDto } from '@hitapi/types';

export class PerformanceEndpointsTableResponseDto implements IPerformanceEndpointsTableResponseDto {
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ enum: RestfulMethod })
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    path: string;

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

    @ApiProperty({ type: 'boolean' })
    excluded: boolean;

    @ApiProperty({ type: 'boolean' })
    removed: boolean;
}
