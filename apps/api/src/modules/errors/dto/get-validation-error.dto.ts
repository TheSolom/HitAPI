import {
    IsArray,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetValidationErrorDto {
    @ApiPropertyOptional({ format: 'bigint' })
    @Transform(({ value }) =>
        BigInt(value as string | number | bigint | boolean),
    )
    @IsOptional()
    id?: bigint;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    msg?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    loc?: string[];

    @ApiPropertyOptional({ format: 'uuid' })
    @IsUUID()
    @IsOptional()
    endpointId?: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 1 })
    @Min(1)
    @IsInt()
    @IsOptional()
    consumerId?: number;
}
