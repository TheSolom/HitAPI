import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class StartupResponseDto {
    @ApiProperty({ type: 'integer' })
    @Expose()
    created: number;

    @ApiProperty({ type: 'integer' })
    @Expose()
    updated: number;

    @ApiProperty({ type: 'integer' })
    @Expose()
    removed: number;

    @ApiProperty({ type: 'integer' })
    @Expose()
    total: number;
}
