import { IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseAnalyticsOptionsDto } from '../../../common/dto/base-analytics-options.dto.js';

export class ExportTrafficCsvOptionsDto extends BaseAnalyticsOptionsDto {
    @ApiProperty({
        type: 'string',
        enum: ['hours', 'days', 'months'],
        default: 'hours',
    })
    @IsEnum(['hours', 'days', 'months'])
    @IsOptional()
    intervals: 'hours' | 'days' | 'months' = 'hours';

    @ApiPropertyOptional({
        type: 'array',
        items: { type: 'string', enum: ['endpoint', 'consumer', 'statusCode'] },
    })
    @IsEnum(['endpoint', 'consumer', 'statusCode'], { each: true })
    @IsOptional()
    groupBy?: ['endpoint' | 'consumer' | 'statusCode'];
}
