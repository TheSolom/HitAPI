import { OffsetPaginationDto } from '../../../common/dto/offset-pagination.dto.js';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TeamResponseDto } from './team-response.dto.js';

export class PaginatedTeamResponseDto extends OffsetPaginationDto<TeamResponseDto> {
    @ApiProperty({ type: TeamResponseDto, isArray: true })
    @Type(() => TeamResponseDto)
    declare items: TeamResponseDto[];
}
