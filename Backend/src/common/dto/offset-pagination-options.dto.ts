import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OffsetPaginationOptionsDto {
    @ApiProperty({ type: 'integer' })
    @Min(1)
    @IsInt()
    @Type(() => Number)
    offset: number;

    @ApiProperty({ type: 'integer' })
    @Max(100)
    @Min(1)
    @IsInt()
    @Type(() => Number)
    limit: number;
}
