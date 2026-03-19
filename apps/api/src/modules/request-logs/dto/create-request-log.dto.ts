import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsDate,
    IsEnum,
    IsInt,
    IsIP,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min,
} from 'class-validator';
import { RestfulMethod } from '@hitapi/shared/enums';

export class CreateRequestLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    requestUuid: string;

    @ApiProperty({ format: 'uuid' })
    @IsString()
    appId: string;

    @ApiProperty({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    method: RestfulMethod;

    @ApiProperty({ type: 'string' })
    @IsString()
    path: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    url: string;

    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    @Max(599)
    @Min(100)
    @IsInt()
    statusCode: number;

    @ApiProperty({ type: 'string' })
    @IsString()
    statusText: string;

    @ApiProperty({ type: 'number', minimum: 0 })
    @Min(0)
    @IsNumber()
    responseTime: number;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'array',
            items: { type: 'string', minItems: 2, maxItems: 2 },
        },
    })
    @IsArray()
    requestHeaders: [string, string][];

    @ApiProperty({
        type: 'array',
        items: {
            type: 'array',
            items: { type: 'string', minItems: 2, maxItems: 2 },
        },
    })
    @IsArray()
    responseHeaders: [string, string][];

    @ApiProperty({ format: 'date-time' })
    @IsDate()
    timestamp: Date;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    @IsOptional()
    requestSize?: number;

    @ApiPropertyOptional({ type: Buffer })
    requestBody?: Buffer;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    @IsOptional()
    responseSize?: number;

    @ApiPropertyOptional({ type: Buffer })
    responseBody?: Buffer;

    @ApiPropertyOptional({ format: 'ip' })
    @IsIP()
    @IsOptional()
    clientIp?: string;

    @ApiPropertyOptional({ pattern: '^[A-Z]{2}$' })
    @Length(2, 2)
    @IsString()
    @IsOptional()
    clientCountryCode?: string;

    @ApiPropertyOptional({ type: 'integer' })
    @Min(0)
    @IsInt()
    @IsOptional()
    consumerId?: number;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    exceptionType?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsOptional()
    @IsString()
    exceptionMessage?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    exceptionStacktrace?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    traceId?: string;
}
