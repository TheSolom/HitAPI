import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OffsetPaginationOptionsDto {
    @ApiProperty({ type: 'integer' })
    @Type(() => Number)
    @Min(1)
    @IsInt()
    offset: number;

    @ApiProperty({ type: 'integer' })
    @Type(() => Number)
    @Max(100)
    @Min(1)
    @IsInt()
    limit: number;
}
