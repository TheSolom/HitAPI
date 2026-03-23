import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsOptional, IsString } from 'class-validator';

export class AddServerErrorDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    msg: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    type: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    traceback: string;

    @ApiProperty({ type: 'integer', minimum: 1 })
    @Min(1)
    @IsInt()
    errorCount: number;

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    endpointId: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 1 })
    @Min(1)
    @IsInt()
    @IsOptional()
    consumerId?: number;
}
