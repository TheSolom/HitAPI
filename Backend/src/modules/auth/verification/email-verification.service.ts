import {
    Injectable,
    Inject,
    InternalServerErrorException,
    BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Services } from '../../../common/constants/services.constant.js';
import type { IRateLimitService } from '../../rate-limit/interfaces/rate-limit-service.interface.js';
import type { IVerificationTokensService } from './interfaces/verification-tokens-service.interface.js';
import type { IMailsService } from '../../mails/interfaces/mails-service.interface.js';
import type { TokenCacheData } from './interfaces/token-cache-data.interface.js';
import type { Environment } from '../../../common/interfaces/env.interface.js';
import { MailSubjects } from '../../mails/enums/mails.enum.js';
import type { IEmailVerificationService } from './interfaces/email-verification-service.interface.js';

@Injectable()
export class EmailVerificationService implements IEmailVerificationService {
    constructor(
        @Inject(Services.RATE_LIMIT)
        private readonly rateLimitService: IRateLimitService,
        @Inject(Services.VERIFICATION_TOKENS)
        private readonly verificationTokenService: IVerificationTokensService,
        @Inject(Services.MAILS)
        private readonly mailsService: IMailsService,
        private readonly configService: ConfigService<Environment, true>,
    ) {}

    async sendVerificationEmail(
        email: string,
        displayName: string,
    ): Promise<string> {
        await this.rateLimitService.checkRateLimit(
            email,
            MailSubjects.EMAIL_VERIFICATION,
        );

        const token = await this.verificationTokenService.createToken(
            {
                email,
                displayName,
                subject: MailSubjects.EMAIL_VERIFICATION,
            },
            Number.parseInt(
                this.configService.get<string>('CACHE_TTL_EMAIL_VERIFICATION'),
            ),
        );

        try {
            await this.mailsService.emailConfirmation({
                to: email,
                data: { token, displayName },
            });
        } catch {
            await this.verificationTokenService.invalidateToken(token);
            throw new InternalServerErrorException(
                'Failed to send verification email. Please try again later.',
            );
        }

        return token;
    }

    async verifyVerificationToken(token: string): Promise<TokenCacheData> {
        const data = await this.verificationTokenService.consumeToken(token);

        if (data.subject !== MailSubjects.EMAIL_VERIFICATION) {
            throw new BadRequestException('Invalid verification token');
        }

        await this.rateLimitService.clearRateLimit(
            data.email,
            MailSubjects.EMAIL_VERIFICATION,
        );

        return data;
    }
}
