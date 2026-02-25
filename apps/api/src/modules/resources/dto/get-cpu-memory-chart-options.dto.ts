import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';
import type { Period } from '../../../common/types/period.type.js';

export class GetCpuMemoryChartOptionsDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    appId: string;

    @ApiPropertyOptional({ type: 'string', default: '24h' })
    @IsPeriod()
    @IsOptional()
    period: Period = '24h';
}
