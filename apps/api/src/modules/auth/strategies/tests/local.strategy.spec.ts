import { jest } from '@jest/globals';
import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import { LocalStrategy } from '../local.strategy.js';
import { AuthenticatedUser } from '../../../users/dto/auth-user.dto.js';

describe('LocalStrategy', () => {
    let strategy: LocalStrategy;
    let authServiceMock: {
        validateUser: jest.Mock<any>;
    };

    beforeEach(() => {
        authServiceMock = {
            validateUser: jest.fn<any>(),
        };
        strategy = new LocalStrategy(authServiceMock);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    it('should throw BadRequestException when request body contains invalid email or password', async () => {
        const req = {
            body: {
                email: 'not-an-email',
                password: '',
            },
        } as unknown as Request;

        await expect(strategy.validate(req)).rejects.toThrow(
            BadRequestException,
        );
        expect(authServiceMock.validateUser).not.toHaveBeenCalled();
    });

    it('should validate and delegate to authService when input is valid', async () => {
        const req = {
            body: {
                email: 'valid@example.com',
                password: 'SecretPassword123',
            },
        } as unknown as Request;

        const expectedUser = Object.assign(new AuthenticatedUser(), {
            id: 'user-1',
            email: 'valid@example.com',
            displayName: 'Valid User',
        });
        authServiceMock.validateUser.mockResolvedValue(expectedUser);

        const result = await strategy.validate(req);

        expect(result).toEqual(expectedUser);
        expect(authServiceMock.validateUser).toHaveBeenCalledWith(
            expect.objectContaining({
                email: 'valid@example.com',
                password: 'SecretPassword123',
            }),
        );
    });
});
