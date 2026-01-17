import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { TeamMember } from './entities/team-member.entity.js';
import { TeamInvite } from './entities/team-invite.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamMembersController } from './team-members.controller.js';
import { TeamInvitesController } from './team-invites.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { TeamsService } from './teams.service.js';
import { TeamMembersService } from './team-members.service.js';
import { TeamInvitesService } from './team-invites.service.js';
import { MailsModule } from '../mails/mails.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([Team, TeamMember, TeamInvite]),
        MailsModule,
    ],
    controllers: [
        TeamsController,
        TeamMembersController,
        TeamInvitesController,
    ],
    providers: [
        {
            provide: Services.TEAMS,
            useClass: TeamsService,
        },
        {
            provide: Services.TEAM_MEMBERS,
            useClass: TeamMembersService,
        },
        {
            provide: Services.TEAM_INVITES,
            useClass: TeamInvitesService,
        },
    ],
})
export class TeamsModule {}
