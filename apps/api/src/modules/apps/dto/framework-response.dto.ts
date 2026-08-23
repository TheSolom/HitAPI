import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { FrameworkDto } from '@hitapi/types';

export class FrameworkResponseDto implements FrameworkDto {
    @Expose()
    @ApiProperty({ type: 'integer' })
    id: number;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;
}
