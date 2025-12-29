import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MetadataResponseDto } from './metadata.response.dto.js';

export class CustomResponse<T> {
    @ApiProperty({ default: 200 })
    statusCode: number;

    @ApiProperty({ default: 'Success' })
    message: string;

    @ApiPropertyOptional({ type: MetadataResponseDto })
    metadata?: MetadataResponseDto;

    @ApiPropertyOptional()
    data?: T;
}
