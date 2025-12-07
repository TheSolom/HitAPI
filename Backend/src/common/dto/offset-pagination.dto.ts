import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export abstract class OffsetPaginationDto<T> {
    @Expose()
    @ApiProperty({ type: 'number' })
    totalItems: number;

    @Expose()
    @ApiProperty({ type: 'number' })
    totalPages: number;

    @Expose()
    @ApiProperty({ isArray: true })
    items: T[];
}
