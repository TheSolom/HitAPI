import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TeamMemberRoles } from '../enums/team-member-roles.enum.js';
import { lowerCaseTransformer } from '../../../common/transformers/lower-case.transformer.js';

export class UpdateTeamMemberDto {
    @ApiProperty({ enum: TeamMemberRoles })
    @IsEnum(TeamMemberRoles)
    @Transform(lowerCaseTransformer)
    role: TeamMemberRoles;
}
