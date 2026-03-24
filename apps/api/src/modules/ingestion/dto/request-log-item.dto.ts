import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsIP,
    Max,
    Min,
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    ValidateNested,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RestfulMethod } from '@hitapi/shared/enums';

export class RequestDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    url: string;

    @ApiProperty({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    method: RestfulMethod;

    @ApiProperty({
        type: 'array',
        items: { type: 'array', items: { type: 'string' } },
    })
    @IsArray()
    headers: [string, string][];

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    timestamp: number;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    path?: string;

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    @IsOptional()
    size?: number;

    @ApiPropertyOptional()
    @IsOptional()
    body?: Buffer;

    @ApiPropertyOptional({ format: 'ip' })
    @IsIP()
    @IsOptional()
    clientIp?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    consumer?: string;
}

export class ResponseDto {
    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    @Max(599)
    @Min(100)
    @IsInt()
    statusCode: number;

    @ApiProperty({ type: 'number', minimum: 0 })
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
    headers: [string, string][];

    @ApiPropertyOptional({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    @IsOptional()
    size?: number;

    @ApiPropertyOptional({ type: Buffer })
    body?: Buffer;
}

export class ExceptionDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    type: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    message: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    stacktrace: string;
}

export class LogRecordDto {
    @ApiProperty({ type: 'string' })
    @IsString()
    level: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    message: string;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @IsInt()
    timestamp: number;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    logger?: string;
}

export class RequestLogItemDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    uuid: string;

    @ApiProperty({ type: RequestDto })
    @Type(() => RequestDto)
    @ValidateNested()
    request: RequestDto;

    @ApiProperty({ type: ResponseDto })
    @Type(() => ResponseDto)
    @ValidateNested()
    response: ResponseDto;

    @ApiPropertyOptional({ type: ExceptionDto })
    @Type(() => ExceptionDto)
    @ValidateNested()
    @IsOptional()
    exception?: ExceptionDto;

    @ApiPropertyOptional({ type: LogRecordDto, isArray: true })
    @Type(() => LogRecordDto)
    @ValidateNested({ each: true })
    @IsArray()
    @IsOptional()
    logs?: LogRecordDto[];

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    traceId?: string;
}

export class IngestRequestLogsDto {
    @ApiProperty({ type: RequestLogItemDto, isArray: true })
    @Type(() => RequestLogItemDto)
    @ValidateNested({ each: true })
    @ArrayMaxSize(1000, { message: 'Maximum 1000 items per batch' })
    @ArrayMinSize(1, { message: 'At least one item is required' })
    @IsArray()
    items: RequestLogItemDto[];
}
