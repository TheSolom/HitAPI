import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RequestLogResponseDto } from './request-log-response.dto.js';

export class RequestLogDetailsResponseDto extends RequestLogResponseDto {
    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    requestHeaders: Array<[string, string]>;

    @ApiProperty({ type: 'string' })
    requestContentType: string | null;

    @ApiProperty({ type: 'string' })
    requestBody: string;

    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    responseHeaders: Array<[string, string]>;

    @ApiProperty({ type: 'string' })
    responseContentType: string | null;

    @ApiProperty({ type: 'string' })
    responseBody: string;

    @ApiPropertyOptional({ type: 'string' })
    exceptionType: string | null;

    @ApiPropertyOptional({ type: 'string' })
    exceptionMessage: string | null;

    @ApiPropertyOptional({ type: 'string' })
    exceptionStacktrace: string | null;

    @ApiProperty({ type: 'integer' })
    applicationLogsCount: number;
}
