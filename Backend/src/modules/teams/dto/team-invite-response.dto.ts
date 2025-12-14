import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { InviteStatus } from '../enums/invite-status.enum.js';
import { UserProfileDto } from '../../users/dto/user-profile.dto.js';

class InviterDto extends UserProfileDto {
    @Transform(({ obj }: { obj: { user: { id: string } } }) => obj.user.id)
    @ApiProperty({ format: 'uuid' })
    declare userId: string;

    @Transform(
        ({ obj }: { obj: { user: { displayName: string } } }) =>
            obj.user.displayName,
    )
    @ApiProperty({ type: 'string' })
    declare displayName: string;

    @Transform(
        ({ obj }: { obj: { user: { email: string } } }) => obj.user.email,
    )
    @ApiProperty({ format: 'email' })
    declare email: string;
}

class TeamDto {
    @ApiProperty({ type: 'string' })
    name: string;
}

export class TeamInviteResponseDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    id: string;

    @Expose()
    @ApiProperty({ format: 'email' })
    email: string;

    @Expose()
    @ApiProperty({ enum: InviteStatus })
    status: InviteStatus;

    @Expose()
    @ApiProperty({ type: InviterDto })
    @Type(() => InviterDto)
    inviter: InviterDto;

    @Expose()
    @ApiProperty({ type: Date })
    expiresAt: Date;
}

export class PublicTeamInviteResponseDto {
    @Expose()
    @ApiProperty({ type: TeamDto })
    team: TeamDto;

    @Expose()
    @ApiProperty({ format: 'email' })
    email: string;

    @Expose()
    @ApiProperty({ type: Date })
    expiresAt: Date;
}
