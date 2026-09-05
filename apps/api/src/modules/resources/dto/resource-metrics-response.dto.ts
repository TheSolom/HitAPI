import { ApiProperty } from '@nestjs/swagger';

export class ResourceMetricsResponseDto {
    @ApiProperty({ type: 'number', minimum: 0 })
    cpuPercentAvg: number;

    @ApiProperty({ type: 'number', minimum: 0 })
    cpuPercentMin: number;

    @ApiProperty({ type: 'number', minimum: 0 })
    cpuPercentMax: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    memoryRssAvg: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    memoryRssMin: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    memoryRssMax: number;
}
