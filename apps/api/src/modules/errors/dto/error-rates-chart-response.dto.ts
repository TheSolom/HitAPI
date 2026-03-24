import { ApiProperty } from '@nestjs/swagger';
import { ErrorType } from '../enums/error-type.enum.js';

export class ErrorRatesChartResponseDto {
    @ApiProperty({ enum: ErrorType })
    errorType: ErrorType;

    @ApiProperty({ type: 'string', isArray: true })
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    errorRates: number[];
}
