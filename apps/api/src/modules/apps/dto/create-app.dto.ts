import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
} from 'class-validator';
import { InStepRange } from '../../../common/validators/in-step-range.validator.js';

export class CreateAppDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ type: 'integer' })
    @Min(1)
    @IsInt()
    @IsNotEmpty()
    frameworkId: number;

    @ApiPropertyOptional({ type: 'integer', default: 500 })
    @InStepRange(10, 10, 60000)
    @Max(60000)
    @Min(10)
    @IsInt()
    @IsOptional()
    targetResponseTimeMs?: number;

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    teamId: string;
}
