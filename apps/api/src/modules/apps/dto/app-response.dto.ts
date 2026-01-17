import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Framework } from '../entities/framework.entity.js';

export class AppResponseDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    slug: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    clientId: string;

    @Expose()
    @ApiProperty({ type: 'number' })
    targetResponseTimeMs: number;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    active: boolean;

    @Expose()
    @ApiProperty({ type: Framework })
    framework: Framework;

    @Expose()
    @ApiProperty({ type: Date })
    createdAt: Date;
}
