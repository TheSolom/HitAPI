import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TeamMemberRoles, type UpdateTeamMemberPayload } from '@hitapi/types';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class UpdateTeamMemberDto implements UpdateTeamMemberPayload {
    @ApiProperty({ enum: TeamMemberRoles })
    @IsEnum(TeamMemberRoles)
    @Transform(lowerCaseTransformer)
    role: TeamMemberRoles;
}
