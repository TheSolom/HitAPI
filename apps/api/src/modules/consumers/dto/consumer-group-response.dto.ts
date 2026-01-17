import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ConsumerGroupResponseDto {
    @Expose()
    @ApiProperty({ type: 'integer' })
    id: number;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;
}
