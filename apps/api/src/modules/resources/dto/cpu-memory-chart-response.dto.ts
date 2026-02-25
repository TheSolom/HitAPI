import { ApiProperty } from '@nestjs/swagger';

export class CpuMemoryChartResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true, nullable: true })
    cpuPercentAvgs: (number | null)[];

    @ApiProperty({ type: 'number', isArray: true, nullable: true })
    cpuPercentMins: (number | null)[];

    @ApiProperty({ type: 'number', isArray: true, nullable: true })
    cpuPercentMaxs: (number | null)[];

    @ApiProperty({ type: 'number', isArray: true })
    memoryRssAvgs: number[];

    @ApiProperty({ type: 'number', isArray: true })
    memoryRssMins: number[];

    @ApiProperty({ type: 'number', isArray: true })
    memoryRssMaxs: number[];
}
