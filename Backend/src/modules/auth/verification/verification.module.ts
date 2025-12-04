import { Module } from '@nestjs/common';
import { Services } from '../../../common/constants/services.constant.js';
import { HashingModule } from '../../hashing/hashing.module.js';
import { MailsModule } from '../../mails/mails.module.js';
import { VerificationTokenService } from './verification-tokens.service.js';
import { EmailVerificationService } from './email-verification.service.js';

@Module({
    imports: [HashingModule, MailsModule],
    providers: [
        {
            provide: Services.VERIFICATION_TOKENS,
            useClass: VerificationTokenService,
        },
        {
            provide: Services.EMAIL_VERIFICATION,
            useClass: EmailVerificationService,
        },
    ],
    exports: [Services.VERIFICATION_TOKENS, Services.EMAIL_VERIFICATION],
})
export class VerificationModule {}
