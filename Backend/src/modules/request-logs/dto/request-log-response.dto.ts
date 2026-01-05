import { ApiProperty } from '@nestjs/swagger';
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

    @ApiProperty({ type: 'integer', minimum: 0 })
    requestSize: number;

    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    statusCode: number;

    @ApiProperty({ type: 'string', nullable: true })
    statusText: string | null;

    @ApiProperty({ type: 'integer', minimum: 0 })
    responseTime: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    responseSize: number;

    @ApiProperty({ format: 'ip' })
    clientIp: string;

    @ApiProperty({ type: 'string' })
    clientCountryName: string;

    @ApiProperty({ pattern: '^[A-Z]{2}$' })
    clientCountryCode: string;

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'integer', minimum: 0 },
        example: { ERROR: 5, WARN: 2, INFO: 10 },
    })
    applicationLogsCountByLevel: Record<string, number>;

    @ApiProperty({ type: 'number' })
    consumerId: number;

    @ApiProperty({ type: 'string' })
    consumerName: string;

    @ApiProperty({ format: 'date-time' })
    timestamp: Date;
}

export class RequestLogResponsePaginatedDto {
    @ApiProperty({ type: RequestLogResponseDto, isArray: true })
    data: RequestLogResponseDto[];

    @ApiProperty({ type: MetadataResponseDto })
    metadata: MetadataResponseDto;
}
