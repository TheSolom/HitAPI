import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SessionsService } from '../sessions.service.js';
import { RefreshToken } from '../../tokens/entities/refresh-token.entity.js';

describe('SessionsService', () => {
    let service: SessionsService;
    let repoMock: {
        find: jest.Mock<any>;
        delete: jest.Mock<any>;
    };

    beforeEach(async () => {
        repoMock = {
            find: jest.fn(),
            delete: jest.fn(async () => ({})),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionsService,
                {
                    provide: getRepositoryToken(RefreshToken),
                    useValue: repoMock,
                },
            ],
        }).compile();

        service = module.get<SessionsService>(SessionsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserActiveSessions', () => {
        it('should query active sessions for given user id', async () => {
            const sessions = [{ id: 'sess-1' }, { id: 'sess-2' }];
            repoMock.find.mockResolvedValue(sessions);

            const result = await service.getUserActiveSessions('user-1');
            expect(result).toEqual(sessions);
            expect(repoMock.find).toHaveBeenCalledWith({
                where: {
                    user: { id: 'user-1' },
                    expiresAt: expect.anything(),
                },
            });
        });
    });

    describe('revokeSession', () => {
        it('should delete session by sessionId', async () => {
            await service.revokeSession('session-uuid-1');

            expect(repoMock.delete).toHaveBeenCalledWith('session-uuid-1');
        });
    });

    describe('revokeAllUserSessions', () => {
        it('should delete all sessions for given user', async () => {
            await service.revokeAllUserSessions('user-uuid-1');

            expect(repoMock.delete).toHaveBeenCalledWith({
                user: { id: 'user-uuid-1' },
            });
        });
    });
});
