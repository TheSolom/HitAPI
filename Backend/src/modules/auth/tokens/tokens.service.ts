import { Inject, Injectable } from '@nestjs/common';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { Services } from '../../../common/constants/services.constant.js';
import type { ITokensService } from './interfaces/tokens-service.interface.js';
import type { IHashingService } from '../../hashing/interfaces/hashing-service.interface.js';
import type { Environment } from '../../../common/interfaces/env.interface.js';
import type { IJwtPayload } from './interfaces/jwt-payload.interface.js';
import { NullableType } from '../../../common/@types/nullable.type.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';
import { LoginTokensDto } from './dto/login-tokens.dto.js';

@Injectable()
export class TokensService implements ITokensService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
        @Inject(Services.HASHING)
        private readonly hashingService: IHashingService,
        private readonly configService: ConfigService<Environment, true>,
        private readonly jwtService: JwtService,
    ) {}

    private async updateLastUsedAsync(tokenId: string): Promise<void> {
        try {
            await this.refreshTokenRepository.update(tokenId, {
                lastUsedAt: new Date(),
            });
        } catch (err) {
            console.error('Failed to update lastUsedAt:', err);
        }
    }

    private async createAccessToken(
        user: AuthenticatedUser,
    ): Promise<{ accessToken: string; accessTokenExpiresIn: number }> {
        const payload: IJwtPayload = {
            sub: user.id,
            email: user.email,
            displayName: user.displayName,
            isVerified: user.isVerified,
            isAdmin: user.isAdmin,
        };

        const accessTokenExpiresIn = Number.parseInt(
            this.configService.getOrThrow<string>(
                'ACCESS_TOKEN_EXPIRATION_TIME',
            ),
        );

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.getOrThrow<string>(
                'ACCESS_TOKEN_SECRET',
            ),
            expiresIn: accessTokenExpiresIn,
        });

        return { accessToken, accessTokenExpiresIn };
    }

    private async createRefreshToken(
        userId: AuthenticatedUser['id'],
        deviceInfo?: string,
        ipAddress?: string,
    ): Promise<{ refreshToken: string; refreshTokenExpiresIn: number }> {
        const token = randomStringGenerator();
        const tokenHash = this.hashingService.hash(token);

        const refreshTokenExpiresIn = Number.parseInt(
            this.configService.getOrThrow<string>(
                'REFRESH_TOKEN_EXPIRATION_TIME',
            ),
        );

        const refreshToken = this.refreshTokenRepository.create({
            tokenHash,
            user: { id: userId },
            deviceInfo,
            ipAddress,
            expiresAt: new Date(Date.now() + refreshTokenExpiresIn * 1000),
        });

        await this.refreshTokenRepository.save(refreshToken);

        return {
            refreshToken: token,
            refreshTokenExpiresIn,
        };
    }

    verifyAccessToken(token: string, secret: string): JwtPayload {
        const decoded: JwtPayload = this.jwtService.verify(token, {
            secret,
        });

        return decoded;
    }

    async verifyRefreshToken(
        token: string,
        userId: string,
    ): Promise<NullableType<RefreshToken>> {
        const tokenHash = this.hashingService.hash(token);

        const storedToken = await this.refreshTokenRepository.findOne({
            where: {
                tokenHash,
                user: { id: userId },
            },
        });

        if (!storedToken) return null;

        if (storedToken.expiresAt < new Date()) {
            await this.revokeRefreshToken(token);
            return null;
        }

        await this.updateLastUsedAsync(storedToken.id);

        return storedToken;
    }

    async generateTokenPair(
        user: AuthenticatedUser,
        deviceInfo?: string,
        ipAddress?: string,
    ): Promise<LoginTokensDto> {
        const ACCESS_TOKEN_TYPE = 'Bearer';

        const { accessToken, accessTokenExpiresIn } =
            await this.createAccessToken(user);

        const { refreshToken, refreshTokenExpiresIn } =
            await this.createRefreshToken(user.id, deviceInfo, ipAddress);

        return {
            access_token: accessToken,
            token_type: ACCESS_TOKEN_TYPE,
            expires_in: accessTokenExpiresIn,
            refresh_token: refreshToken,
            refresh_token_expires_in: refreshTokenExpiresIn,
        };
    }

    async revokeRefreshToken(token: string): Promise<void> {
        const tokenHash = this.hashingService.hash(token);

        await this.refreshTokenRepository.delete({ tokenHash });
    }
}
