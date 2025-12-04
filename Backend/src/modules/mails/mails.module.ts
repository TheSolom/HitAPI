import { Module } from '@nestjs/common';
import { MailerModule } from '../mailer/mailer.module.js';
import { MailsService } from './mails.service.js';
import { Services } from '../../common/constants/services.constant.js';

@Module({
    imports: [MailerModule],
    providers: [
        {
            provide: Services.MAILS,
            useClass: MailsService,
        },
    ],
    exports: [Services.MAILS],
})
export class MailsModule {}
