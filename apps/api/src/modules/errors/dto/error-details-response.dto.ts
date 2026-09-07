import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import type { ErrorDetailsResponseDto as IErrorDetailsResponseDto } from '@hitapi/types';

export class ErrorDetailsResponseDto implements IErrorDetailsResponseDto {
    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    requestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Expose()
    affectedConsumers: number;

    @ApiProperty({ type: 'string' })
    @Expose()
    lastTimestamp: string;
}
