import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { RefreshToken } from '../tokens/entities/refresh-token.entity.js';
import type { ISessionsService } from './interfaces/sessions-service.interface.js';

@Injectable()
export class SessionsService implements ISessionsService {
    constructor(
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {}

    async getUserActiveSessions(userId: string): Promise<RefreshToken[]> {
        return this.refreshTokenRepository.find({
            where: {
                user: { id: userId },
                isRevoked: false,
                deletedAt: IsNull(),
                expiresAt: MoreThan(new Date()),
            },
        });
    }

    async revokeSession(sessionId: string): Promise<void> {
        await this.refreshTokenRepository.update(sessionId, {
            deletedAt: new Date(),
            isRevoked: true,
        });
    }

    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.refreshTokenRepository.update(
            {
                user: { id: userId },
                deletedAt: IsNull(),
            },
            {
                deletedAt: new Date(),
                isRevoked: true,
            },
        );
    }
}
