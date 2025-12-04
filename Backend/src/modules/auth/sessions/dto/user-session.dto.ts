import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserSessionDto {
    @ApiProperty({ type: 'string' })
    id: string;

    @ApiPropertyOptional({ type: 'string' })
    deviceInfo?: string;

    @ApiPropertyOptional({ type: 'string' })
    ipAddress?: string;

    @ApiPropertyOptional({ type: Date })
    lastUsedAt?: Date;

    @ApiProperty({ type: Date })
    createdAt: Date;
}
