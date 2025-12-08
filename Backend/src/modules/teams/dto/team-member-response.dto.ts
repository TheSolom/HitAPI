import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { UserProfileDto } from '../../users/dto/user-profile.dto.js';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';

export class TeamMemberResponseDto extends UserProfileDto {
    @Expose()
    @ApiProperty({ type: String })
    declare id: string;

    @Expose()
    @Transform(({ obj }: { obj: { user?: { id: string } } }) => obj.user?.id)
    declare userId: string;

    @Expose()
    @Transform(
        ({ obj }: { obj: { user?: { displayName: string } } }) =>
            obj.user?.displayName,
    )
    declare displayName: string;

    @Expose()
    @Transform(
        ({ obj }: { obj: { user?: { email: string } } }) => obj.user?.email,
    )
    declare email: string;

    @Expose()
    @ApiProperty({ enum: TeamMemberRoles })
    role: TeamMemberRoles;

    @Expose()
    @ApiProperty({ type: Date })
    joinedAt: Date;
}
