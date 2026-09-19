import { ApiProperty } from '@nestjs/swagger';
import type { ApdexScoreChartResponseDto as IApdexScoreChartResponseDto } from '@hitapi/types';

export class ApdexScoreChartResponseDto implements IApdexScoreChartResponseDto {
    @ApiProperty({ type: 'array', items: { type: 'string' } })
    timeWindows: string[];

    @ApiProperty({ type: 'array', items: { type: 'number', nullable: true } })
    apdexScores: Array<number | null>;

    @ApiProperty({ type: 'array', items: { type: 'integer' } })
    totalRequestCounts: number[];
}
