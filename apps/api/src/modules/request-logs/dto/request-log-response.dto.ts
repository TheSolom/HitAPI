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

    @ApiProperty({ type: 'string' })
    statusText: string;

    @ApiProperty({ type: 'number', minimum: 0 })
    responseTime: number;

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'integer', minimum: 1 },
        example: { ERROR: 5, WARN: 2 },
    })
    applicationLogsCountByLevel: Record<string, number>;

    @ApiProperty({ format: 'date-time' })
    timestamp: Date;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    requestSize?: number;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    responseSize?: number;

    @ApiPropertyOptional({ format: 'ip' })
    clientIp?: string;

    @ApiPropertyOptional({ type: 'string' })
    clientCountryName?: string;

    @ApiPropertyOptional({ pattern: '^[A-Z]{2}$' })
    clientCountryCode?: string;

    @ApiPropertyOptional({ type: 'integer' })
    consumerId?: number;

    @ApiPropertyOptional({ type: 'string' })
    consumerIdentifier?: string;

    @ApiPropertyOptional({ type: 'string' })
    consumerName?: string;
}

export class RequestLogResponsePaginatedDto {
    @ApiProperty({ type: RequestLogResponseDto, isArray: true })
    data: RequestLogResponseDto[];

    @ApiProperty({ type: MetadataResponseDto })
    metadata: MetadataResponseDto;
}
