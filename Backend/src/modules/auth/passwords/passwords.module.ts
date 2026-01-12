import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module.js';
import { SessionsModule } from '../sessions/sessions.module.js';
import { VerificationModule } from '../verification/verification.module.js';
import { MailsModule } from '../../mails/mails.module.js';
import { PasswordsController } from './passwords.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import { PasswordsService } from './passwords.service.js';
import { PasswordsResetService } from './passwords-reset.service.js';

@Module({
    imports: [UsersModule, SessionsModule, VerificationModule, MailsModule],
    controllers: [PasswordsController],
    providers: [
        {
            provide: Services.PASSWORD,
            useClass: PasswordsService,
        },
        {
            provide: Services.PASSWORD_RESET,
            useClass: PasswordsResetService,
        },
    ],
})
export class PasswordsModule {}
