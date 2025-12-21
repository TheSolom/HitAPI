import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class UpdateConsumerDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: 'integer' })
    @IsInt()
    @IsOptional()
    consumerGroupId?: number | null;
}
