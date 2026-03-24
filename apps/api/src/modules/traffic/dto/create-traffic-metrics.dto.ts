import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNumber,
    IsOptional,
    IsUUID,
    IsDate,
    Min,
} from 'class-validator';

export class CreateTrafficMetricsDto {
    @ApiProperty({ type: 'integer' })
    @Min(1)
    @IsInt()
    requestCount: number;

    @ApiProperty({ type: 'integer' })
    @Min(0)
    @IsInt()
    requestSizeSum: number;

    @ApiProperty({ type: 'integer' })
    @Min(0)
    @IsInt()
    responseSizeSum: number;

    @ApiProperty({ type: 'number' })
    @Min(0)
    @IsNumber()
    responseTimeP50: number;

    @ApiProperty({ type: 'number' })
    @Min(0)
    @IsNumber()
    responseTimeP75: number;

    @ApiProperty({ type: 'number' })
    @Min(0)
    @IsNumber()
    responseTimeP95: number;

    @ApiProperty({ type: Date })
    @IsDate()
    timeWindow: Date;

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    endpointId: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 1 })
    @Min(1)
    @IsInt()
    @IsOptional()
    consumerId?: number;
}
