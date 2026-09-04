import { jest } from '@jest/globals';
import { PostgresExceptionFilter } from '../database-exception.filter.js';
import { HttpStatus } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { AppLoggerService } from '../../../modules/logger/logger.service.js';
import { ClsService } from 'nestjs-cls';
import { ConfigService } from '@nestjs/config';

describe('PostgresExceptionFilter', () => {
    let filter: PostgresExceptionFilter;
    let loggerMock: {
        setContext: jest.Mock<any>;
        info: jest.Mock<any>;
        error: jest.Mock<any>;
    };
    let clsMock: {
        get: jest.Mock<any>;
    };
    let configMock: {
        get: jest.Mock<any>;
    };

    let responseMock: {
        status: jest.Mock<any>;
        json: jest.Mock<any>;
    };
    let requestMock: any;
    let hostMock: ArgumentsHost;

    beforeEach(() => {
        loggerMock = {
            setContext: jest.fn<any>(),
            info: jest.fn<any>(),
            error: jest.fn<any>(),
        };
        clsMock = {
            get: jest.fn<any>((key: string) => {
                if (key === 'traceId') return 'trace-456';
                if (key === 'startTime') return 0n;
                return undefined;
            }),
        };
        configMock = {
            get: jest.fn<any>(),
        };

        filter = new PostgresExceptionFilter(
            loggerMock as unknown as AppLoggerService,
            clsMock as unknown as ClsService<any>,
            configMock as unknown as ConfigService<any, true>,
        );

        responseMock = {
            status: jest.fn<any>().mockReturnThis(),
            json: jest.fn<any>(),
        };
        requestMock = {
            method: 'POST',
            originalUrl: '/api/apps',
            url: '/api/apps',
        };

        hostMock = {
            switchToHttp: () => ({
                getRequest: () => requestMock,
                getResponse: () => responseMock,
            }),
        } as unknown as ArgumentsHost;
    });

    it('should be defined', () => {
        expect(filter).toBeDefined();
    });

    it('should catch unique violation (23505) and return 409 Conflict', () => {
        const driverError = {
            code: '23505',
            detail: 'Key (email)=(test@example.com) already exists.',
        };
        const error = new QueryFailedError(
            'INSERT INTO users...',
            [],
            driverError as any,
        );

        filter.catch(error, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
        expect(responseMock.json).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Conflict',
                status: HttpStatus.CONFLICT,
                detail: 'This value already exists',
                errors: [
                    {
                        field: 'email',
                        detail: 'test@example.com already exists',
                    },
                ],
            }),
        );
    });

    it('should catch foreign key violation (23503) and return 400 Bad Request', () => {
        const driverError = {
            code: '23503',
            detail: 'Key (teamId)=(nonexistent-id) is not present in table teams.',
        };
        const error = new QueryFailedError(
            'INSERT INTO members...',
            [],
            driverError as any,
        );

        filter.catch(error, hostMock);

        expect(responseMock.status).toHaveBeenCalledWith(
            HttpStatus.BAD_REQUEST,
        );
        expect(responseMock.json).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Bad Request',
                status: HttpStatus.BAD_REQUEST,
                detail: 'Invalid value',
                errors: [{ field: 'teamId', detail: 'Invalid teamId' }],
            }),
        );
    });
});
