import { ApiProperty } from '@nestjs/swagger';
import type { MetadataResponse } from '@hitapi/types';

export class MetadataResponseDto implements MetadataResponse {
    @ApiProperty({ type: 'integer' })
    totalItems: number;

    @ApiProperty({ type: 'integer' })
    totalPages: number;

    @ApiProperty({ type: 'integer' })
    currentPage: number;
}
