import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class EndpointConfigResponseDto {
    @Expose()
    @ApiProperty({ type: 'boolean' })
    excluded: boolean;

    @Expose()
    @ApiPropertyOptional({ type: 'integer', nullable: true })
    targetResponseTimeMs: number | null;
}
