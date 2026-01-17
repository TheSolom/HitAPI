import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { MetadataResponseDto } from '../../../common/dto/metadata.response.dto.js';

export class RequestLogResponseDto {
    @ApiProperty({ format: 'uuid' })
    requestUuid: string;

    @ApiProperty({ enum: RestfulMethods })
    method: RestfulMethods;

    @ApiProperty({ type: 'string' })
    path: string;

    @ApiProperty({ type: 'string' })
    url: string;

    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    statusCode: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    responseTime: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    responseSize: number;

    @ApiProperty({ format: 'date-time' })
    timestamp: Date;

    @ApiPropertyOptional({ type: 'string' })
    statusText?: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    requestSize?: number;

    @ApiPropertyOptional({ format: 'ip' })
    clientIp?: string;

    @ApiPropertyOptional({ type: 'string' })
    clientCountryName?: string;

    @ApiPropertyOptional({ pattern: '^[A-Z]{2}$' })
    clientCountryCode?: string;

    @ApiPropertyOptional({ type: 'integer' })
    consumerId?: number;

    @ApiPropertyOptional({ type: 'string' })
    consumerName?: string;

    @ApiPropertyOptional({
        type: 'object',
        additionalProperties: { type: 'integer', minimum: 0 },
        example: { ERROR: 5, WARN: 2 },
    })
    applicationLogsCountByLevel?: Record<string, number>;
}

export class RequestLogResponsePaginatedDto {
    @ApiProperty({ type: RequestLogResponseDto, isArray: true })
    data: RequestLogResponseDto[];

    @ApiProperty({ type: MetadataResponseDto })
    metadata: MetadataResponseDto;
}
