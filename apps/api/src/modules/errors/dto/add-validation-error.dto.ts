import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsInt,
    Min,
    IsOptional,
    IsString,
    IsArray,
} from 'class-validator';

export class AddValidationErrorDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    msg: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    type: string;

    @ApiProperty({ type: 'array', items: { type: 'string' } })
    @IsString({ each: true })
    @IsArray()
    loc: string[];

    @ApiProperty({ type: 'integer', minimum: 1 })
    @Min(1)
    @IsInt()
    errorCount: number;

    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    endpointId: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 1 })
    @IsInt()
    @Min(1)
    @IsOptional()
    consumerId?: number;
}
