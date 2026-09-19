import { ApiProperty } from '@nestjs/swagger';
import type { ResponseTimeChartResponseDto as IResponseTimeChartResponseDto } from '@hitapi/types';

export class ResponseTimeChartResponseDto implements IResponseTimeChartResponseDto {
    @ApiProperty({ type: 'array', items: { type: 'string' } })
    timeWindows: string[];

    @ApiProperty({ type: 'array', items: { type: 'number', nullable: true } })
    responseTimeP50: Array<number | null>;

    @ApiProperty({ type: 'array', items: { type: 'number', nullable: true } })
    responseTimeP75: Array<number | null>;

    @ApiProperty({ type: 'array', items: { type: 'number', nullable: true } })
    responseTimeP95: Array<number | null>;
}
