import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
    type ErrorRatesChartResponseDto as IErrorRatesChartResponseDto,
    ErrorType,
} from '@hitapi/types';

export class ErrorRatesChartResponseDto implements IErrorRatesChartResponseDto {
    @ApiProperty({ enum: ErrorType })
    @Expose()
    errorType: ErrorType;

    @ApiProperty({ type: 'string', isArray: true })
    @Expose()
    timeWindows: string[];

    @ApiProperty({ type: 'number', isArray: true })
    @Expose()
    errorRates: number[];
}
