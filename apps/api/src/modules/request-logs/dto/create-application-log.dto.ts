import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsInt, IsDate } from 'class-validator';

export class CreateApplicationLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    requestUuid: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    message: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    level: string;

    @ApiProperty({ format: 'date-time' })
    @IsDate()
    timestamp: Date;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    logger?: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    file?: string;

    @ApiPropertyOptional({ type: 'integer' })
    @IsInt()
    @IsOptional()
    line?: number;
}
