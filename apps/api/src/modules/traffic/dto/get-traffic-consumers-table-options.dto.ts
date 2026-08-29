import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsUUID,
    IsNotEmpty,
    IsInt,
    IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import { OrderDirection, type Period } from '@hitapi/types';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';

export class GetTrafficConsumersTableOptionsDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    appId: string;

    @ApiPropertyOptional({
        type: 'string',
        default: '24h',
        example: '24h, 7d, or start|end',
    })
    @IsPeriod()
    @IsOptional()
    period: Period = '24h';

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

    @ApiPropertyOptional({ enum: RestfulMethod })
    @IsEnum(RestfulMethod)
    @IsOptional()
    method?: RestfulMethod;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    path?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    pathExact?: boolean;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    statusCode?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    search?: string;

    @ApiPropertyOptional({ type: 'boolean' })
    @Type(() => Boolean)
    @IsBoolean()
    @IsOptional()
    onlyNew?: boolean;

    @ApiPropertyOptional({
        enum: ['name', 'requests', 'errorRate', 'lastRequest'],
        default: 'requests',
    })
    @IsIn(['name', 'requests', 'errorRate', 'lastRequest'])
    @IsOptional()
    sortBy?: 'name' | 'requests' | 'errorRate' | 'lastRequest' = 'requests';

    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.DESC })
    @IsEnum(OrderDirection)
    @IsOptional()
    order?: OrderDirection = OrderDirection.DESC;
}
