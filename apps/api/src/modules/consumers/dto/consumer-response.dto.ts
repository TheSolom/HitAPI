import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ConsumerGroupResponseDto } from './consumer-group-response.dto.js';

export class ConsumerResponseDto {
    @Expose()
    @ApiProperty({ type: 'integer' })
    id: number;

    @Expose()
    @ApiProperty({ type: 'string' })
    identifier: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;

    @Expose()
    @ApiProperty({ type: () => ConsumerGroupResponseDto, nullable: true })
    @Type(() => ConsumerGroupResponseDto)
    group: ConsumerGroupResponseDto | null;
}
