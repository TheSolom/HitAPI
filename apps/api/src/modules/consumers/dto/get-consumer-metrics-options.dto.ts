import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import type { Period } from '@hitapi/types';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';

export class GetConsumerMetricsOptionsDto {
    @ApiPropertyOptional({
        type: 'string',
        example: '24h, 7d, or start|end',
    })
    @IsPeriod()
    @IsOptional()
    period?: Period;
}
