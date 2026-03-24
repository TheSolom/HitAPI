import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ErrorMetricsResponseDto {
    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    totalRequestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    totalErrorCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    clientErrorCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    serverErrorCount: number;

    @ApiProperty({ type: 'number', minimum: 0, maximum: 100 })
    @Expose()
    errorRate: number;
}
