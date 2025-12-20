import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EndpointResponseDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    method: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    path: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string', nullable: true })
    summary: string | null;

    @Expose()
    @ApiPropertyOptional({ type: 'string', nullable: true })
    description: string | null;

    @Expose()
    @ApiProperty({ type: 'number' })
    targetResponseTimeMs: number;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    excluded: boolean;
}
