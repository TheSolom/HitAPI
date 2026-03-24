import { ApiProperty } from '@nestjs/swagger';

export class SizeHistogramResponseDto {
    @ApiProperty({ type: 'integer', isArray: true })
    bins: number[];

    @ApiProperty({ type: 'integer', isArray: true })
    counts: number[];

    @ApiProperty({ type: 'integer' })
    binSize: number;
}
