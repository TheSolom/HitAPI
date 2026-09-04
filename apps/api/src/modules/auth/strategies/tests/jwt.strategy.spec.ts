import { jest } from '@jest/globals';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy.js';
import type { IJwtPayload } from '../../tokens/interfaces/jwt-payload.interface.js';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let configServiceMock: {
        getOrThrow: jest.Mock<any>;
    };

    beforeEach(() => {
        configServiceMock = {
            getOrThrow: jest.fn<any>((key: string) => {
                if (key === 'ACCESS_TOKEN_SECRET')
                    return 'test-access-token-secret';
                return '';
            }),
        };

        strategy = new JwtStrategy(
            configServiceMock as unknown as ConfigService<any, true>,
        );
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should validate and map JWT payload to AuthenticatedUser', () => {
        const payload: IJwtPayload = {
            sub: 'user-uuid-1',
            email: 'user@example.com',
            displayName: 'John Doe',
            isVerified: true,
            isAdmin: false,
        };

        const result = strategy.validate(payload);

        expect(result).toEqual({
            id: 'user-uuid-1',
            email: 'user@example.com',
            displayName: 'John Doe',
            isVerified: true,
            isAdmin: false,
        });
    });
});
