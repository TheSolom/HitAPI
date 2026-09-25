import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ApplicationLogResponseDto as IApplicationLogResponseDto } from '@hitapi/types';

export class ApplicationLogResponseDto implements IApplicationLogResponseDto {
    @Expose()
    @ApiProperty({ type: 'string' })
    message: string;

    @Expose()
    @ApiProperty({ format: 'date-time' })
    timestamp: Date;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    level?: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    logger?: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    file?: string;

    @Expose()
    @ApiPropertyOptional({ type: 'integer' })
    line?: number;
}
