import { ApiProperty } from '@nestjs/swagger';

export class DataTransferredChartResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    requestSizeSums: number[];

    @ApiProperty({ type: 'integer', isArray: true })
    responseSizeSums: number[];
}
