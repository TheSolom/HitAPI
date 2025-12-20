import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { InStepRange } from '../../../common/validators/in-step-range.validator.js';

export class UpdateEndpointConfigDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    method: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @IsBoolean()
    @IsOptional()
    excluded?: boolean;

    @ApiPropertyOptional({ type: 'number' })
    @InStepRange(10, 10, 60000)
    @Max(60000)
    @Min(10)
    @IsInt()
    @IsOptional()
    targetResponseTimeMs?: number;
}
