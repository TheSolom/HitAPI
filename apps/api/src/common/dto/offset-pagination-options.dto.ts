import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { OffsetPaginationOptions } from '@hitapi/types';

export class OffsetPaginationOptionsDto implements OffsetPaginationOptions {
    @ApiPropertyOptional({
        type: 'integer',
        default: 1,
        minimum: 1,
        description: 'Page number (1-based offset)',
    })
    @Type(() => Number)
    @Min(1)
    @IsInt()
    @IsOptional()
    offset: number = 1;

    @ApiPropertyOptional({
        type: 'integer',
        default: 20,
        minimum: 1,
        maximum: 100,
        description: 'Number of items per page',
    })
    @Type(() => Number)
    @Max(100)
    @Min(1)
    @IsInt()
    @IsOptional()
    limit: number = 20;
}
