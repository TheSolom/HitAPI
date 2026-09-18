import { ApiProperty } from '@nestjs/swagger';
import type { SizeHistogramResponseDto as ISizeHistogramResponseDto } from '@hitapi/types';

export class SizeHistogramResponseDto implements ISizeHistogramResponseDto {
    @ApiProperty({ type: 'integer', isArray: true })
    bins: number[];

    @ApiProperty({ type: 'integer', isArray: true })
    counts: number[];

    @ApiProperty({ type: 'integer' })
    binSize: number;
}
