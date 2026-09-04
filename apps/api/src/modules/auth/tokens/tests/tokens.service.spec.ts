import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokensService } from '../tokens.service.js';
import { RefreshToken } from '../entities/refresh-token.entity.js';
import { Services } from '../../../../common/constants/services.constant.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

describe('TokensService', () => {
    let service: TokensService;
    let repoMock: {
        create: jest.Mock<any>;
        save: jest.Mock<any>;
        findOne: jest.Mock<any>;
        update: jest.Mock<any>;
        delete: jest.Mock<any>;
    };
    let hashingServiceMock: {
        hash: jest.Mock<any>;
    };
    let jwtServiceMock: {
        signAsync: jest.Mock<any>;
        verify: jest.Mock<any>;
    };
    let configServiceMock: {
        getOrThrow: jest.Mock<any>;
    };

    const mockUser: AuthenticatedUser = Object.assign(new AuthenticatedUser(), {
        id: 'user-uuid-1',
        email: 'user@example.com',
        displayName: 'Test User',
        isVerified: true,
        isAdmin: false,
    });

    beforeEach(async () => {
        repoMock = {
            create: jest.fn<any>((dto: any) => dto),
            save: jest.fn<any>(async (entity: any) => entity),
            findOne: jest.fn<any>(),
            update: jest.fn<any>(async () => ({})),
            delete: jest.fn<any>(async () => ({})),
        };
        hashingServiceMock = {
            hash: jest.fn((str: string) => `hashed_${str}`),
        };
        jwtServiceMock = {
            signAsync: jest.fn(async () => 'jwt.access.token'),
            verify: jest.fn(() => ({ sub: 'user-uuid-1' })),
        };
        configServiceMock = {
            getOrThrow: jest.fn((key: string) => {
                if (key === 'ACCESS_TOKEN_EXPIRATION_TIME') return '900';
                if (key === 'ACCESS_TOKEN_SECRET') return 'test-secret';
                if (key === 'REFRESH_TOKEN_EXPIRATION_TIME') return '604800';
                return '';
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokensService,
                {
                    provide: getRepositoryToken(RefreshToken),
                    useValue: repoMock,
                },
                {
                    provide: Services.HASHING,
                    useValue: hashingServiceMock,
                },
                {
                    provide: JwtService,
                    useValue: jwtServiceMock,
                },
                {
                    provide: ConfigService,
                    useValue: configServiceMock,
                },
            ],
        }).compile();

        service = module.get<TokensService>(TokensService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTokenPair', () => {
        it('should create and return access and refresh token pair', async () => {
            const result = await service.generateTokenPair(
                mockUser,
                'Chrome/Mac',
                '127.0.0.1',
            );

            expect(result.access_token).toBe('jwt.access.token');
            expect(result.token_type).toBe('Bearer');
            expect(result.expires_in).toBe(900);
            expect(result.refresh_token).toBeDefined();
            expect(result.refresh_token_expires_in).toBe(604800);

            expect(jwtServiceMock.signAsync).toHaveBeenCalled();
            expect(repoMock.save).toHaveBeenCalled();
        });
    });

    describe('verifyAccessToken', () => {
        it('should decode verified JWT token', () => {
            const decoded = service.verifyAccessToken(
                'jwt.access.token',
                'test-secret',
            );

            expect(decoded).toEqual({ sub: 'user-uuid-1' });
            expect(jwtServiceMock.verify).toHaveBeenCalledWith(
                'jwt.access.token',
                { secret: 'test-secret' },
            );
        });
    });

    describe('verifyRefreshToken', () => {
        it('should return null when token is not found', async () => {
            repoMock.findOne.mockResolvedValue(null);

            const result = await service.verifyRefreshToken('non-existent');
            expect(result).toBeNull();
        });

        it('should return null and revoke if token is expired', async () => {
            repoMock.findOne.mockResolvedValue({
                id: 'token-id-1',
                tokenHash: 'hashed_expired-token',
                expiresAt: new Date(Date.now() - 10000),
            });

            const result = await service.verifyRefreshToken('expired-token');
            expect(result).toBeNull();
            expect(repoMock.delete).toHaveBeenCalledWith({
                tokenHash: 'hashed_expired-token',
            });
        });

        it('should return stored token and update last used date when valid', async () => {
            const validToken = {
                id: 'token-id-1',
                tokenHash: 'hashed_valid-token',
                expiresAt: new Date(Date.now() + 60000),
            };
            repoMock.findOne.mockResolvedValue(validToken);

            const result = await service.verifyRefreshToken(
                'valid-token',
                'user-uuid-1',
            );
            expect(result).toEqual(validToken);
            expect(repoMock.update).toHaveBeenCalledWith(
                'token-id-1',
                expect.objectContaining({ lastUsedAt: expect.any(Date) }),
            );
        });
    });

    describe('revokeRefreshToken', () => {
        it('should delete token by hash', async () => {
            await service.revokeRefreshToken('token-to-revoke');

            expect(repoMock.delete).toHaveBeenCalledWith({
                tokenHash: 'hashed_token-to-revoke',
            });
        });
    });

    describe('removeExpiredRefreshTokens', () => {
        it('should delete tokens with expiresAt < now', async () => {
            await service.removeExpiredRefreshTokens();

            expect(repoMock.delete).toHaveBeenCalledWith({
                expiresAt: expect.anything(),
            });
        });
    });
});
