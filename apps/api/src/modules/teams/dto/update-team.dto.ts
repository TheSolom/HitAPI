import { PartialType } from '@nestjs/swagger';
import type { UpdateTeamPayload } from '@hitapi/types';
import { CreateTeamDto } from './create-team.dto.js';

export class UpdateTeamDto
    extends PartialType(CreateTeamDto)
    implements UpdateTeamPayload {}
