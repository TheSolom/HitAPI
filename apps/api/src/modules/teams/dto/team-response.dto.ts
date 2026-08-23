import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import type { TeamResponseDto as ITeamResponseDto } from '@hitapi/types';
import { TeamMemberResponseDto } from './team-member-response.dto.js';
import { TeamInviteResponseDto } from './team-invite-response.dto.js';

export class TeamResponseDto implements ITeamResponseDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    name: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    slug: string;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    demo: boolean;

    @Expose()
    @ApiProperty({ type: 'boolean' })
    stealth: boolean;

    @Expose()
    @ApiProperty({ type: TeamMemberResponseDto, isArray: true })
    @Type(() => TeamMemberResponseDto)
    teamMembers: TeamMemberResponseDto[];

    @Expose()
    @ApiProperty({ type: TeamInviteResponseDto, isArray: true })
    @Type(() => TeamInviteResponseDto)
    invites: TeamInviteResponseDto[];

    @Expose()
    @ApiProperty({ type: Date })
    createdAt: Date;
}
