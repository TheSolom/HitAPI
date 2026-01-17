import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ISocialAccountsService } from './interfaces/social-account-service.interface.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import { SocialAccount } from '../users/entities/social-account.entity.js';
import { AuthProvidersEnum } from '../auth/enums/auth-providers.enum.js';

@Injectable()
export class SocialAccountsService implements ISocialAccountsService {
    constructor(
        @InjectRepository(SocialAccount)
        private readonly socialAccountRepository: Repository<SocialAccount>,
    ) {}

    async findBySocialId(
        provider: AuthProvidersEnum,
        socialId: string,
    ): Promise<NullableType<SocialAccount>> {
        return this.socialAccountRepository.findOne({
            where: { provider, socialId },
            relations: ['user'],
        });
    }

    async findAllByUserId(userId: string): Promise<SocialAccount[]> {
        return this.socialAccountRepository.findBy({ user: { id: userId } });
    }

    async createOrUpdate(
        userId: string,
        socialId: string,
        provider: AuthProvidersEnum,
    ): Promise<SocialAccount> {
        let socialAccount = await this.socialAccountRepository.findOne({
            where: { socialId, provider },
        });

        if (!socialAccount) {
            socialAccount = this.socialAccountRepository.create({
                user: { id: userId },
                socialId,
                provider,
            });
        }

        return this.socialAccountRepository.save(socialAccount);
    }

    async hasMultipleLoginMethods(userId: string): Promise<boolean> {
        const socialAccounts = await this.findAllByUserId(userId);

        const hasPassword = !!socialAccounts[0].user?.password;
        const hasSocialAccounts = socialAccounts.length > 0;
        const hasMultipleSocialAccounts = socialAccounts.length > 1;

        return (hasPassword && hasSocialAccounts) || hasMultipleSocialAccounts;
    }

    async unlinkAccount(
        userId: string,
        provider: AuthProvidersEnum,
    ): Promise<boolean> {
        const result = await this.socialAccountRepository.delete({
            user: { id: userId },
            provider,
        });

        return result.affected ? result.affected > 0 : false;
    }
}
