import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import {
    ArrayMinSize,
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

export class CreateRequestLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    requestUuid: string;

    @ApiProperty({ format: 'uuid' })
    @IsString()
    appId: string;

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

    @ApiProperty({ type: 'string' })
    @IsString()
    statusText: string;

    @ApiProperty({ type: 'number', minimum: 0 })
    @IsNumber()
    responseTime: number;

    @ApiProperty({ type: 'array', items: { type: 'string' } })
    @ArrayMinSize(1, { message: 'At least one header is required' })
    @IsArray()
    requestHeaders: [string, string][];

    @ApiProperty({ type: 'array', items: { type: 'string' } })
    @ArrayMinSize(1, { message: 'At least one header is required' })
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

    @ApiProperty({ type: 'integer', minimum: 0 })
    @IsInt()
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
