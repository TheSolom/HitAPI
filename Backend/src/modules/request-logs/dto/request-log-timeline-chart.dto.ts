import { ApiProperty } from '@nestjs/swagger';

export class RequestLogTimelineChartDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    itemCounts: number[];
}
