import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsInt, IsDate } from 'class-validator';

export class CreateApplicationLogDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    requestUuid: string;

    @ApiProperty({ type: 'string' })
    @IsString()
    message: string;

    @ApiPropertyOptional({ type: 'string' })
    @IsString()
    @IsOptional()
    level?: string;

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

    @ApiProperty()
    @IsDate()
    timestamp: Date;
}
