import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { TeamMember } from './entities/team-member.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamMembersController } from './team-members.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { TeamsService } from './teams.service.js';
import { TeamsMembersService } from './team-members.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([Team, TeamMember])],
    controllers: [TeamsController, TeamMembersController],
    providers: [
        {
            provide: Services.TEAMS,
            useClass: TeamsService,
        },
        {
            provide: Services.TEAM_MEMBERS,
            useClass: TeamsMembersService,
        },
    ],
})
export class TeamsModule {}
