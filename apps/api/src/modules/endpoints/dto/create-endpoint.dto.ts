import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { InStepRange } from '../../../common/validators/in-step-range.validator.js';

export class CreateEndpointDto {
    @ApiProperty({ enum: RestfulMethods })
    @IsEnum(RestfulMethods)
    method: RestfulMethods;

    @ApiProperty({ type: 'string' })
    @IsString()
    path: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    summary?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ type: 'integer' })
    @InStepRange(10, 10, 60000)
    @Max(60000)
    @Min(10)
    @IsInt()
    @IsOptional()
    targetResponseTimeMs?: number;

    @ApiPropertyOptional({ type: 'boolean' })
    @IsBoolean()
    @IsOptional()
    excluded?: boolean;
}
