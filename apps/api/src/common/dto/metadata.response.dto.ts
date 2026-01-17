import { ApiProperty } from '@nestjs/swagger';

export class MetadataResponseDto {
    @ApiProperty({ type: 'integer' })
    totalItems: number;

    @ApiProperty({ type: 'integer' })
    totalPages: number;

    @ApiProperty({ type: 'integer' })
    currentPage: number;
}
