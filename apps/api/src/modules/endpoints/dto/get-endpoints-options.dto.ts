import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import type { GetEndpointsQuery } from '@hitapi/types';

export class GetEndpointsOptionsDto implements GetEndpointsQuery {
    @ApiPropertyOptional({ type: 'string' })
    @Transform(({ value }: { value?: string | null }) =>
        typeof value === 'string' ? value.trim() : value,
    )
    @IsString()
    @IsOptional()
    search?: string;
}
