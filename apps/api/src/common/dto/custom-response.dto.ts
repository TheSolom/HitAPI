import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CustomResponse as ICustomResponse } from '@hitapi/types';
import { MetadataResponseDto } from './metadata.response.dto.js';

export class CustomResponse<T> implements ICustomResponse<T> {
    @ApiProperty({ default: 'Success' })
    message: string;

    @ApiPropertyOptional({ type: MetadataResponseDto })
    metadata?: MetadataResponseDto;

    @ApiPropertyOptional()
    data?: T;
}
