import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import {
    IsDate,
    IsEnum,
    IsInt,
    IsIP,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min,
} from 'class-validator';

export class CreateRequestLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    requestUuid: string;

    @ApiProperty({ enum: RestfulMethods })
    @IsEnum(RestfulMethods)
    method: RestfulMethods;

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

    @ApiProperty({ type: 'integer', minimum: 0 })
    @IsInt()
    responseTime: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @IsInt()
    responseSize: number;

    @ApiProperty({ format: 'date-time' })
    @IsDate()
    timestamp: Date;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    statusText?: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    @IsOptional()
    requestSize?: number;

    @ApiPropertyOptional({
        type: 'object',
        additionalProperties: { type: 'string' },
    })
    @IsObject()
    @IsOptional()
    requestHeaders?: Record<string, string>;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    requestBody?: string;

    @ApiPropertyOptional({
        type: 'object',
        additionalProperties: { type: 'string' },
    })
    @IsObject()
    @IsOptional()
    responseHeaders?: Record<string, string>;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    responseBody?: string;

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
    @IsInt()
    @IsOptional()
    consumerId?: number;

    @ApiProperty({ format: 'uuid' })
    @IsString()
    appId: string;

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
}
