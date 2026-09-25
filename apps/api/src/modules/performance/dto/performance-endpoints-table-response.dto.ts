import { ApiProperty } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { PerformanceEndpointsTableResponseDto as IPerformanceEndpointsTableResponseDto } from '@hitapi/types';
import { PerformanceMetricsResponseDto } from './performance-metrics-response.dto.js';

export class PerformanceEndpointsTableResponseDto
    extends PerformanceMetricsResponseDto
    implements IPerformanceEndpointsTableResponseDto
{
    @ApiProperty({ format: 'uuid' })
    id: string;

    @ApiProperty({ enum: RestfulMethod })
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    path: string;

    @ApiProperty({ type: 'boolean' })
    excluded: boolean;

    @ApiProperty({ type: 'boolean' })
    removed: boolean;
}
