import { ApiProperty } from '@nestjs/swagger';
import { ErrorType } from '../enums/error-type.enum.js';
import { Expose } from 'class-transformer';

export class ErrorsChartResponseDto {
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
