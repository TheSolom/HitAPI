import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Max,
    Min,
} from 'class-validator';
import { RestfulMethod } from '@hitapi/shared/enums';
import { InStepRange } from '../../../common/validators/in-step-range.validator.js';

export class UpdateEndpointConfigDto {
    @ApiProperty({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    @IsNotEmpty()
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @IsBoolean()
    @IsOptional()
    excluded?: boolean;

    @ApiPropertyOptional({ type: 'integer' })
    @InStepRange(10, 10, 60000)
    @Max(60000)
    @Min(10)
    @IsInt()
    @IsOptional()
    targetResponseTimeMs?: number;
}
