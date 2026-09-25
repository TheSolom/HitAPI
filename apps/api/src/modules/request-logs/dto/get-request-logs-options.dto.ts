import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import { OffsetPaginationOptionsDto } from '../../../common/dto/offset-pagination-options.dto.js';
import { OrderDirection } from '@hitapi/types';
import { BaseRequestLogsOptionsDto } from './base-request-logs-options.dto.js';

export class GetRequestLogsOptionsDto extends IntersectionType(
    OffsetPaginationOptionsDto,
    BaseRequestLogsOptionsDto,
) {
    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.DESC })
    @IsEnum(OrderDirection)
    @IsOptional()
    order?: OrderDirection = OrderDirection.DESC;
}
