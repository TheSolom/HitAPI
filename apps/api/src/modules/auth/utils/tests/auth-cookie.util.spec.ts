import { jest } from '@jest/globals';
import type { Response } from 'express';
import { Environment } from '@hitapi/types';
import {
    REFRESH_TOKEN_COOKIE,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
} from '../auth-cookie.util.js';

describe('auth-cookie.util', () => {
    let mockResponse: {
        cookie: jest.Mock;
        clearCookie: jest.Mock;
    };
    let mockConfigService: {
        get: jest.Mock<any>;
    };

    beforeEach(() => {
        mockResponse = {
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
        mockConfigService = {
            get: jest.fn<any>(),
        };
    });

    describe('setRefreshTokenCookie', () => {
        it('should set secure cookie in production environment', () => {
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return Environment.Production;
                if (key === 'REFRESH_TOKEN_EXPIRATION_TIME') return 604800; // 7 days
                return undefined;
            });

            setRefreshTokenCookie(
                mockResponse as unknown as Response,
                'sample-refresh-token',
                mockConfigService as never,
            );

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                REFRESH_TOKEN_COOKIE,
                'sample-refresh-token',
                {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'none',
                    path: '/',
                    maxAge: 604800 * 1000,
                },
            );
        });

        it('should set lax and non-secure cookie in non-production environment', () => {
            mockConfigService.get.mockImplementation((key: string) => {
                if (key === 'NODE_ENV') return Environment.Development;
                if (key === 'REFRESH_TOKEN_EXPIRATION_TIME') return 3600;
                return undefined;
            });

            setRefreshTokenCookie(
                mockResponse as unknown as Response,
                'dev-refresh-token',
                mockConfigService as never,
            );

            expect(mockResponse.cookie).toHaveBeenCalledWith(
                REFRESH_TOKEN_COOKIE,
                'dev-refresh-token',
                {
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax',
                    path: '/',
                    maxAge: 3600 * 1000,
                },
            );
        });
    });

    describe('clearRefreshTokenCookie', () => {
        it('should clear refresh token cookie with httpOnly and path', () => {
            clearRefreshTokenCookie(mockResponse as unknown as Response);

            expect(mockResponse.clearCookie).toHaveBeenCalledWith(
                REFRESH_TOKEN_COOKIE,
                {
                    httpOnly: true,
                    path: '/',
                },
            );
        });
    });
});
