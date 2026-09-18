import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { StatusCodeCountsResponseDto as IStatusCodeCountsResponseDto } from '@hitapi/types';

export class StatusCodeCountsResponseDto implements IStatusCodeCountsResponseDto {
    @ApiProperty({ enum: RestfulMethod })
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    path: string;

    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    statusCode: number;

    @ApiPropertyOptional({ type: 'string' })
    description?: string;

    @ApiProperty({ type: 'integer', minimum: 0 })
    requestCount: number;
}
