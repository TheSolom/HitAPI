import { ApiProperty } from '@nestjs/swagger';
import type { DataTransferredChartResponseDto as IDataTransferredChartResponseDto } from '@hitapi/types';

export class DataTransferredChartResponseDto implements IDataTransferredChartResponseDto {
    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true })
    requestSizeSums: number[];

    @ApiProperty({ type: 'integer', isArray: true })
    responseSizeSums: number[];
}
