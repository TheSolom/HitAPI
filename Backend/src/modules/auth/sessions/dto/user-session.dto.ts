import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserSessionDto {
    @Expose()
    @ApiProperty({ type: 'string' })
    id: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    deviceInfo?: string;

    @Expose()
    @ApiPropertyOptional({ type: 'string' })
    ipAddress?: string;

    @Expose()
    @ApiPropertyOptional({ type: Date })
    lastUsedAt?: Date;

    @Expose()
    @ApiProperty({ type: Date })
    createdAt: Date;
}
