import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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
                expiresAt: MoreThan(new Date()),
            },
        });
    }

    async revokeSession(sessionId: string): Promise<void> {
        await this.refreshTokenRepository.delete(sessionId);
    }

    async revokeAllUserSessions(userId: string): Promise<void> {
        await this.refreshTokenRepository.delete({
            user: { id: userId },
        });
    }
}
