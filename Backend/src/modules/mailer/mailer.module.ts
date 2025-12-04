import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service.js';
import { Services } from '../../common/constants/services.constant.js';

@Module({
    providers: [
        {
            provide: Services.MAILER,
            useClass: MailerService,
        },
    ],
    exports: [Services.MAILER],
})
export class MailerModule {}
