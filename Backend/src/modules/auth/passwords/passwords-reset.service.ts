import {
    Injectable,
    Inject,
    BadRequestException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Services } from '../../../common/constants/services.constant.js';
import type { IPasswordsResetService } from './interfaces/passwords-reset-service.interface.js';
import type { IRateLimitService } from '../../rate-limit/interfaces/rate-limit-service.interface.js';
import type { IVerificationTokensService } from '../verification/interfaces/verification-tokens-service.interface.js';
import type { IMailsService } from '../../mails/interfaces/mails-service.interface.js';
import type { Environment } from 'src/common/interfaces/env.interface.js';
import type { TokenCacheData } from '../verification/interfaces/token-cache-data.interface.js';
import { MailSubjects } from '../../mails/enums/mails.enum.js';

@Injectable()
export class PasswordsResetService implements IPasswordsResetService {
    constructor(
        @Inject(Services.RATE_LIMIT)
        private readonly rateLimitService: IRateLimitService,
        @Inject(Services.VERIFICATION_TOKENS)
        private readonly verificationTokensService: IVerificationTokensService,
        @Inject(Services.MAILS)
        private readonly mailsService: IMailsService,
        private readonly configService: ConfigService<Environment, true>,
    ) {}

    async sendPasswordResetEmail(
        email: string,
        displayName: string,
    ): Promise<string> {
        const normalizedEmail = email.toLowerCase();

        await this.rateLimitService.checkRateLimit(
            normalizedEmail,
            MailSubjects.PASSWORD_RESET,
        );

        const token = await this.verificationTokensService.createToken(
            {
                email: normalizedEmail,
                displayName,
                subject: MailSubjects.PASSWORD_RESET,
            },
            Number.parseInt(
                this.configService.get<string>('CACHE_TTL_PASSWORD_RESET'),
            ),
        );

        try {
            await this.mailsService.passwordReset({
                to: email,
                data: { token, displayName },
            });
        } catch {
            await this.verificationTokensService.invalidateToken(token);
            throw new InternalServerErrorException(
                'Failed to send password reset email. Please try again later.',
            );
        }

        return token;
    }

    async verifyResetToken(token: string): Promise<TokenCacheData> {
        const data = await this.verificationTokensService.consumeToken(token);

        if (data.subject !== MailSubjects.PASSWORD_RESET) {
            throw new BadRequestException('Invalid reset token');
        }

        return data;
    }
}
