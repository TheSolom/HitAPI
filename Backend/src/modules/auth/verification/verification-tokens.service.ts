import { MaybeType } from '../../../common/@types/maybe.type.js';
import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { IVerificationTokensService } from './interfaces/verification-tokens-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import type { TokenCacheData } from './interfaces/token-cache-data.interface.js';

@Injectable()
export class VerificationTokenService implements IVerificationTokensService {
    constructor(
        @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
    ) {}

    private getTokenKey(token: string): string {
        return `verification:${this.hashingService.hash(token)}`;
    }

    async createToken(data: TokenCacheData, ttl: number): Promise<string> {
        const token = randomStringGenerator();
        const tokenKey = this.getTokenKey(token);

        await this.cacheService.set(tokenKey, data, ttl * 1000);

        return token;
    }

    async getTokenData(token: string): Promise<MaybeType<TokenCacheData>> {
        const tokenKey = this.getTokenKey(token);
        return await this.cacheService.get<TokenCacheData>(tokenKey);
    }

    async invalidateToken(token: string): Promise<void> {
        const tokenKey = this.getTokenKey(token);
        await this.cacheService.del(tokenKey);
    }

    async consumeToken(token: string): Promise<TokenCacheData> {
        const data = await this.getTokenData(token);
        if (!data) {
            throw new BadRequestException('Invalid or expired token');
        }

        await this.invalidateToken(token);
        return data;
    }
}
