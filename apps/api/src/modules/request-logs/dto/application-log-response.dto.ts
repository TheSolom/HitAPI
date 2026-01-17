import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ApplicationLogResponseDto {
    @Expose()
    @ApiProperty({ type: 'string' })
    message: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    level: string | null;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    logger: string | null;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    file: string | null;

    @Expose()
    @ApiPropertyOptional({ type: 'integer' })
    line: number | null;

    @Expose()
    @ApiProperty({ format: 'date-time' })
    timestamp: Date;
}
