import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestLogResponseDto } from './request-log-response.dto.js';

export class RequestLogDetailsResponseDto extends RequestLogResponseDto {
    @ApiProperty({ type: 'integer' })
    applicationLogsCount: number;

    @ApiPropertyOptional({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    requestHeaders?: Record<string, string>;

    @ApiPropertyOptional({ type: 'string' })
    requestContentType?: string;

    @ApiPropertyOptional({ type: 'string' })
    requestBody?: string;

    @ApiPropertyOptional({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    responseHeaders?: Record<string, string>;

    @ApiPropertyOptional({ type: 'string' })
    responseContentType?: string;

    @ApiPropertyOptional({ type: 'string' })
    responseBody?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionType?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionMessage?: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionStacktrace?: string;
}
