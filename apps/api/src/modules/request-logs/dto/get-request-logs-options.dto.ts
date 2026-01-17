import {
    IsOptional,
    IsString,
    IsBoolean,
    IsIP,
    IsDateString,
    IsEnum,
    IsInt,
    IsUUID,
    IsNotEmpty,
    Max,
    Min,
    IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { StringValue } from 'ms';
import { IsStringValue } from '../../../common/validators/is-string-value.validator.js';
import { OffsetPaginationOptionsDto } from '../../../common/dto/offset-pagination-options.dto.js';
import { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';
import { OrderDirection } from '../../../common/enums/order-direction.enum.js';

export class GetRequestLogsOptionsDto extends OffsetPaginationOptionsDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    appId: string;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    consumerId?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsInt()
    @IsOptional()
    consumerGroupId?: number;

    @ApiPropertyOptional({ enum: RestfulMethods })
    @IsEnum(RestfulMethods)
    @IsOptional()
    method?: RestfulMethods;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    path?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    pathExact?: boolean;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @Max(600)
    @Min(100)
    @IsInt()
    @IsOptional()
    statusCode?: number;

    @ApiPropertyOptional({ type: 'string' })
    @IsStringValue()
    @IsOptional()
    period?: StringValue;

    @ApiPropertyOptional({ format: 'date-time' })
    @IsDateString()
    @IsOptional()
    minTimestamp?: string;

    @ApiPropertyOptional({ format: 'date-time' })
    @IsDateString()
    @IsOptional()
    maxTimestamp?: string;

    @ApiPropertyOptional({ format: 'url' })
    @IsString()
    @IsOptional()
    url?: string;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    minRequestSize?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    maxRequestSize?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    minResponseSize?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    maxResponseSize?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    minResponseTime?: number;

    @ApiPropertyOptional({ type: 'integer' })
    @Type(() => Number)
    @IsPositive()
    @IsInt()
    @IsOptional()
    maxResponseTime?: number;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    requestBody?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    responseBody?: string;

    @ApiPropertyOptional({ format: 'ip' })
    @IsIP()
    @IsOptional()
    clientIp?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    logLevel?: string;

    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.DESC })
    @IsEnum(OrderDirection)
    @IsOptional()
    order?: OrderDirection = OrderDirection.DESC;
}
