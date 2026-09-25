import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { type ExportRequestLogsOptions, OrderDirection } from '@hitapi/types';
import { BaseRequestLogsOptionsDto } from './base-request-logs-options.dto.js';

export class ExportRequestLogsOptionsDto
    extends BaseRequestLogsOptionsDto
    implements ExportRequestLogsOptions
{
    @ApiPropertyOptional({ enum: OrderDirection, default: OrderDirection.DESC })
    @IsEnum(OrderDirection)
    @IsOptional()
    order?: OrderDirection = OrderDirection.DESC;

    @ApiPropertyOptional({
        type: 'integer',
        minimum: 1,
        maximum: 10000,
        default: 10000,
    })
    @Type(() => Number)
    @Max(10000)
    @Min(1)
    @IsInt()
    @IsOptional()
    limit?: number = 10000;
}
