import {
    IsOptional,
    IsString,
    IsNumber,
    IsArray,
    ValidateNested,
    IsUUID,
    IsObject,
    IsInt,
    Min,
    Max,
    IsBoolean,
    IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ConsumerInfo } from '@hitapi/types';
import { PathInfoDto } from './path-info.dto.js';

export class ConsumerMethodPathDto extends PathInfoDto {
    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    consumer?: string;
}

export class RequestsItemDto extends ConsumerMethodPathDto {
    @ApiProperty({ type: 'integer', minimum: 100, maximum: 599 })
    @Max(599)
    @Min(100)
    @IsInt()
    statusCode: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    requestCount: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    requestSizeSum: number;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    responseSizeSum: number;

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'integer' },
    })
    @IsObject()
    responseTimes: Record<number, number>;

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'integer' },
    })
    @IsObject()
    requestSizes: Record<number, number>;

    @ApiProperty({
        type: 'object',
        additionalProperties: { type: 'integer' },
    })
    @IsObject()
    responseSizes: Record<number, number>;
}

export class ServerErrorsItemDto extends ConsumerMethodPathDto {
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
}

export class ValidationErrorsItemDto extends ConsumerMethodPathDto {
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
}

export class SyncConsumerItemDto implements ConsumerInfo {
    @ApiProperty({ type: 'string' })
    @IsString()
    @IsNotEmpty()
    identifier: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    group?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @IsBoolean()
    @IsOptional()
    hidden?: boolean;
}

export class ResourcesDto {
    @ApiProperty({ type: 'number', minimum: 0, nullable: true })
    @Min(0)
    @IsNumber()
    @IsOptional()
    cpuPercent: number | null;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    memoryRss: number;
}

export class SyncPayloadDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    messageUuid: string;

    @ApiProperty({ type: RequestsItemDto, isArray: true })
    @Type(() => RequestsItemDto)
    @ValidateNested({ each: true })
    @IsArray()
    requests: RequestsItemDto[];

    @ApiProperty({ type: ServerErrorsItemDto, isArray: true })
    @Type(() => ServerErrorsItemDto)
    @ValidateNested({ each: true })
    @IsArray()
    serverErrors: ServerErrorsItemDto[];

    @ApiProperty({ type: ValidationErrorsItemDto, isArray: true })
    @Type(() => ValidationErrorsItemDto)
    @ValidateNested({ each: true })
    @IsArray()
    validationErrors: ValidationErrorsItemDto[];

    @ApiProperty({ type: () => SyncConsumerItemDto, isArray: true })
    @Type(() => SyncConsumerItemDto)
    @ValidateNested({ each: true })
    @IsArray()
    consumers: SyncConsumerItemDto[];

    @ApiProperty()
    @Type(() => ResourcesDto)
    @ValidateNested()
    resources: ResourcesDto;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Min(0)
    @IsInt()
    timestamp: number;
}
