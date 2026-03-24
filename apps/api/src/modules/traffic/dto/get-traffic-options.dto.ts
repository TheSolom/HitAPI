import {
    IsString,
    IsOptional,
    IsBoolean,
    IsEnum,
    IsUUID,
    IsNotEmpty,
    IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RestfulMethod } from '@hitapi/shared/enums';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';
import type { Period } from '../../../common/types/period.type.js';

export class GetTrafficOptionsDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    appId: string;

    @ApiPropertyOptional({ type: 'string', default: '24h' })
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
}
