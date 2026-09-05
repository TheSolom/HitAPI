import { IsOptional, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsPeriod } from '../../../common/validators/is-period.validator.js';
import type {
    Period,
    GetCpuMemoryChartOptions as IGetCpuMemoryChartOptions,
} from '@hitapi/types';

export class GetCpuMemoryChartOptionsDto implements IGetCpuMemoryChartOptions {
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
}
