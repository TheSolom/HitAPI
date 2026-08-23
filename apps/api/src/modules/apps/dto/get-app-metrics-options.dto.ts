import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';
import type { Period } from '@hitapi/types';

export class GetAppMetricsOptionsDto {
    @ApiPropertyOptional({
        type: 'string',
        default: '24h',
        example: '24h, 7d, or start|end',
    })
    @IsPeriod()
    @IsOptional()
    period: Period = '24h';
}
