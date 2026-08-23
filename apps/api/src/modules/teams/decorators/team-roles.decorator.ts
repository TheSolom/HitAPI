import { SetMetadata } from '@nestjs/common';
import { TEAM_ROLES_KEY } from '../../../common/constants/keys.constant.js';
import { TeamMemberRoles } from '@hitapi/types';

export const TeamRoles = (...roles: TeamMemberRoles[]) =>
    SetMetadata(TEAM_ROLES_KEY, roles);
