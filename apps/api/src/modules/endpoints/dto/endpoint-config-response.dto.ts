import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { EndpointConfigResponseDto as IEndpointConfigResponseDto } from '@hitapi/types';

export class EndpointConfigResponseDto implements IEndpointConfigResponseDto {
    @Expose()
    @ApiProperty({ type: 'boolean' })
    excluded: boolean;

    @Expose()
    @ApiPropertyOptional({ type: 'integer', nullable: true })
    targetResponseTimeMs: number | null;
}
