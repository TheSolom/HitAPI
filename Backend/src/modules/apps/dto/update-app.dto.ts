import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { InStepRange } from '../../../common/validators/in-step-range.validator.js';

export class UpdateAppDto {
    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: 'number' })
    @Min(1)
    @IsInt()
    @IsOptional()
    frameworkId?: number;

    @ApiPropertyOptional({ type: 'number', default: 500 })
    @InStepRange(10, 10, 60000)
    @Max(60000)
    @Min(10)
    @IsInt()
    @IsOptional()
    targetResponseTimeMs?: number;
}
