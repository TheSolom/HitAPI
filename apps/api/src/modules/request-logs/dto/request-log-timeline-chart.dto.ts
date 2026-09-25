import { ApiProperty } from '@nestjs/swagger';
import type { RequestLogTimelineChartDto as IRequestLogTimelineChartDto } from '@hitapi/types';

export class RequestLogTimelineChartDto implements IRequestLogTimelineChartDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    itemCounts: number[];
}
