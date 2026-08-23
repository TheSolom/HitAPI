import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { SocialAccount } from './entities/social-account.entity.js';
import { TeamMember } from '../teams/entities/team-member.entity.js';
import { UsersController } from './users.controller.js';
import { Services } from '../../common/constants/services.constant.js';
import { UsersService } from './users.service.js';
import { SocialAccountsService } from './social-accounts.service.js';
import { SessionsModule } from '../auth/sessions/sessions.module.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, SocialAccount, TeamMember]),
        SessionsModule,
    ],
    controllers: [UsersController],
    providers: [
        {
            provide: Services.USERS,
            useClass: UsersService,
        },
        {
            provide: Services.SOCIAL_ACCOUNTS,
            useClass: SocialAccountsService,
        },
    ],
    exports: [Services.USERS, Services.SOCIAL_ACCOUNTS],
})
export class UsersModule {}
