import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { UserProfileDto } from '../../users/dto/user-profile.dto.js';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';

export class TeamMemberResponseDto extends UserProfileDto {
    @Expose()
    @ApiProperty({ format: 'uuid' })
    declare id: string;

    @Expose()
    @Transform(({ obj }: { obj: { user?: { id: string } } }) => obj.user?.id)
    @ApiProperty({ format: 'uuid' })
    declare userId: string;

    @Expose()
    @Transform(
        ({ obj }: { obj: { user?: { displayName: string } } }) =>
            obj.user?.displayName,
    )
    @ApiProperty({ type: 'string' })
    declare displayName: string;

    @Expose()
    @Transform(
        ({ obj }: { obj: { user?: { email: string } } }) => obj.user?.email,
    )
    @ApiProperty({ format: 'email' })
    declare email: string;

    @Expose()
    @ApiProperty({ enum: TeamMemberRoles })
    role: TeamMemberRoles;

    @Expose()
    @ApiProperty({ type: Date })
    joinedAt: Date;
}
