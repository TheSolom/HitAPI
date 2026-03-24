import { ApiProperty } from '@nestjs/swagger';

export class RequestsPerMinuteChartResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    requestsPerMinute: number[];
}
