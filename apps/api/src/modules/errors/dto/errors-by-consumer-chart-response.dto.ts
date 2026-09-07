import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ErrorsByConsumerChartResponseDto as IErrorsByConsumerChartResponseDto } from '@hitapi/types';

export class ErrorsByConsumerChartResponseDto implements IErrorsByConsumerChartResponseDto {
    @ApiProperty({ type: 'integer', isArray: true })
    @Expose()
    consumerIds: number[];

    @ApiProperty({ type: 'string', isArray: true })
    @Expose()
    consumerNames: string[];

    @ApiProperty({ type: 'integer', isArray: true, minimum: 0 })
    @Expose()
    requestCounts: number[];
}
