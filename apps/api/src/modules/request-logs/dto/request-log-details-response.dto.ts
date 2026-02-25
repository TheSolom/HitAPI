import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestLogResponseDto } from './request-log-response.dto.js';

export class RequestLogDetailsResponseDto extends RequestLogResponseDto {
    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    requestHeaders: [string, string][];

    @ApiProperty({ type: 'string' })
    requestContentType: string;

    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    responseHeaders: [string, string][];

    @ApiProperty({ type: 'string' })
    responseContentType: string;

    @ApiProperty({ type: 'integer' })
    applicationLogsCount: number;

    @ApiPropertyOptional({ type: 'string' })
    requestBody?: string;

    @ApiPropertyOptional({ type: 'string' })
    responseBody?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionType?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionMessage?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionStacktrace?: string;

    @ApiPropertyOptional({ type: 'string' })
    traceId?: string;
}
