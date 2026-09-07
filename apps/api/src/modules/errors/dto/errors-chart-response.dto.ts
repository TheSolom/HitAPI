import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    type ErrorsChartResponseDto as IErrorsChartResponseDto,
    ErrorType,
} from '@hitapi/types';

export class ErrorsChartResponseDto implements IErrorsChartResponseDto {
    @ApiProperty({ enum: ErrorType })
    @Expose()
    errorType: ErrorType;

    @ApiProperty({ type: 'string', isArray: true })
    @Expose()
    timeWindows: string[];

    @ApiProperty({ type: 'integer', isArray: true, minimum: 0 })
    @Expose()
    requestCounts: number[];

    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'integer' } },
    })
    @Expose()
    statusCodeCounts: [number, number][][];
}
