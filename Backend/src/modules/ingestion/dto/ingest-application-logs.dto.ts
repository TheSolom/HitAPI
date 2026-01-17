import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    ValidateNested,
    ArrayMaxSize,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateApplicationLogDto } from '../../request-logs/dto/create-application-log.dto.js';

export class IngestApplicationLogsDto {
    @ApiProperty({ type: CreateApplicationLogDto, isArray: true })
    @Type(() => CreateApplicationLogDto)
    @ValidateNested({ each: true })
    @ArrayMaxSize(2000, { message: 'Maximum 2000 logs per batch' })
    @ArrayMinSize(1, { message: 'At least one log is required' })
    @IsArray()
    logs: CreateApplicationLogDto[];
}
