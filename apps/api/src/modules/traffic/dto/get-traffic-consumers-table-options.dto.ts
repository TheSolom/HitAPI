import { IsString, IsOptional, IsBoolean, IsEnum, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderDirection } from '@hitapi/types';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class GetTrafficConsumersTableOptionsDto extends BaseAnalyticsOptionsDto {
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
