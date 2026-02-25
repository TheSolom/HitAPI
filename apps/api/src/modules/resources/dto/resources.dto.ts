import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsInt, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ResourcesDto {
    @ApiProperty({ type: 'number', minimum: 0, nullable: true })
    @Type(() => Number)
    @Min(0)
    @IsNumber()
    @IsOptional()
    cpuPercent?: number | null;

    @ApiProperty({ type: 'integer', minimum: 0 })
    @Type(() => Number)
    @Min(0)
    @IsInt()
    memoryRss: number;

    @ApiProperty({ type: Date })
    @Type(() => Date)
    @IsDate()
    timeWindow: Date;
}
