import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailsResponseDto {
    @ApiProperty({ type: 'integer', minimum: 0 })
    requestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    affectedConsumers: number;

    @ApiProperty({ type: 'string' })
    lastTimestamp: string;
}
