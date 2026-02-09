import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';

export class EndpointResponseDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ enum: RestfulMethods })
    method: RestfulMethods;

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
    @ApiPropertyOptional({ type: 'integer', nullable: true })
    targetResponseTimeMs: number | null;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    excluded: boolean;
}
