import { IsIn, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TeamMemberRoles, type AddTeamMemberPayload } from '@hitapi/types';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class AddTeamMemberDto implements AddTeamMemberPayload {
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
