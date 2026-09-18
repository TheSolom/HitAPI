import { ApiProperty } from '@nestjs/swagger';
import type { RequestsPerMinuteChartResponseDto as IRequestsPerMinuteChartResponseDto } from '@hitapi/types';

export class RequestsPerMinuteChartResponseDto implements IRequestsPerMinuteChartResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    requestsPerMinute: number[];
}
