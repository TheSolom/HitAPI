import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './entities/team.entity.js';
import { TeamsController } from './teams.controller.js';
import { TeamsService } from './teams.service.js';
import { TeamMember } from './entities/team-member.entity.js';
import { Services } from '../../common/constants/services.constant.js';

@Module({
    imports: [TypeOrmModule.forFeature([Team, TeamMember])],
    controllers: [TeamsController],
    providers: [
        {
            provide: Services.TEAMS,
            useClass: TeamsService,
        },
    ],
})
export class TeamsModule {}
