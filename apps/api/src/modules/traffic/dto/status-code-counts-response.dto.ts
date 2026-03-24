import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';

export class StatusCodeCountsResponseDto {
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
