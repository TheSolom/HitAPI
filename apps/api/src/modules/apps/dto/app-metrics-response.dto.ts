import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { AppMetricsDto } from '@hitapi/types';

export class AppMetricsResponseDto implements AppMetricsDto {
    @Expose()
    @ApiProperty({
        type: 'integer',
        description: 'Total number of requests in the specified period',
    })
    requestCount: number;

    @Expose()
    @ApiProperty({
        type: 'number',
        description: 'Error rate percentage (0 - 100)',
    })
    errorRate: number;

    @Expose()
    @ApiProperty({
        type: 'number',
        description: 'Apdex score (0 - 1)',
    })
    apdexScore: number;

    @Expose()
    @ApiProperty({
        type: 'integer',
        description: 'Number of active consumers in the specified period',
    })
    consumerCount: number;
}
