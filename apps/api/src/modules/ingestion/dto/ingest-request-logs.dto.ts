import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsEnum,
    IsInt,
    IsIP,
    IsObject,
    IsOptional,
    IsString,
    IsDate,
    Max,
    Min,
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { CreateConsumerDto } from '../../consumers/dto/create-consumer.dto.js';

class RequestLogDto {
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

    @ApiPropertyOptional()
    @Type(() => CreateConsumerDto)
    @ValidateNested()
    @IsOptional()
    consumer?: CreateConsumerDto;

    @ApiPropertyOptional({ type: 'string' })
    @IsOptional()
    @IsString()
    exceptionType?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    exceptionMessage?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    exceptionStacktrace?: string;
}

export class IngestRequestLogsDto {
    @ApiProperty({ type: RequestLogDto, isArray: true })
    @Type(() => RequestLogDto)
    @ValidateNested({ each: true })
    @ArrayMaxSize(1000, { message: 'Maximum 1000 requests per batch' })
    @ArrayMinSize(1, { message: 'At least one request is required' })
    @IsArray()
    requests: RequestLogDto[];
}
