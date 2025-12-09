import { IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class AddTeamMemberDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    userId: string;

    @ApiProperty({
        enum: [TeamMemberRoles.MEMBER],
        default: TeamMemberRoles.MEMBER,
    })
    @IsIn([TeamMemberRoles.MEMBER])
    @Transform(lowerCaseTransformer)
    role: TeamMemberRoles = TeamMemberRoles.MEMBER;
}
