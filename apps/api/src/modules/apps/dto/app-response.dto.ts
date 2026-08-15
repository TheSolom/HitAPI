import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { AppResponseDto as IAppResponseDto } from '@hitapi/types';
import { Framework } from '../entities/framework.entity.js';

export class AppResponseDto implements IAppResponseDto {
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
    @ApiProperty({ type: 'integer' })
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
