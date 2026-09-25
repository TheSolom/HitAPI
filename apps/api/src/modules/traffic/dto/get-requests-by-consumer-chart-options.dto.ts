import { IsInt, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class GetRequestsByConsumerChartOptionsDto extends BaseAnalyticsOptionsDto {
    @ApiProperty({ type: 'integer', default: 100 })
    @Type(() => Number)
    @Max(100)
    @Min(1)
    @IsInt()
    limit: number = 100;
}
