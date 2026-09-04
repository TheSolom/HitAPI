import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ServerErrorsService } from '../server-errors.service.js';
import { ServerError } from '../entities/server-error.entity.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { GetServerErrorDto } from '../dto/get-server-error.dto.js';
import type { AddServerErrorDto } from '../dto/add-server-error.dto.js';

describe('ServerErrorsService', () => {
    let service: ServerErrorsService;
    let errorsRepositoryMock: {
        getServerErrorsTable: jest.Mock<any>;
    };
    let serverErrorsRepositoryMock: {
        findOneBy: jest.Mock<any>;
        insert: jest.Mock<any>;
        increment: jest.Mock<any>;
        delete: jest.Mock<any>;
    };

    beforeEach(async () => {
        errorsRepositoryMock = {
            getServerErrorsTable: jest.fn(),
        };

        serverErrorsRepositoryMock = {
            findOneBy: jest.fn(),
            insert: jest.fn(),
            increment: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ServerErrorsService,
                {
                    provide: Repositories.ERRORS,
                    useValue: errorsRepositoryMock,
                },
                {
                    provide: getRepositoryToken(ServerError),
                    useValue: serverErrorsRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<ServerErrorsService>(ServerErrorsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getServerErrorsTable', () => {
        it('should delegate to errors repository', async () => {
            const dto: GetValidationAndServerErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetValidationAndServerErrorOptionsDto;

            errorsRepositoryMock.getServerErrorsTable.mockResolvedValue([
                { id: '1', message: 'Internal Error' },
            ]);

            const result = await service.getServerErrorsTable(dto);

            expect(
                errorsRepositoryMock.getServerErrorsTable,
            ).toHaveBeenCalledWith(dto);
            expect(result).toEqual([{ id: '1', message: 'Internal Error' }]);
        });
    });

    describe('getServerError', () => {
        it('should find error by criteria with default repository', async () => {
            const dto: GetServerErrorDto = {
                endpointId: 'ep-uuid-10',
                consumerId: 20,
                msg: 'Internal Server Error',
            };

            const expectedError = { id: 1n, msg: 'Internal Server Error' };
            serverErrorsRepositoryMock.findOneBy.mockResolvedValue(
                expectedError,
            );

            const result = await service.getServerError(dto);

            expect(serverErrorsRepositoryMock.findOneBy).toHaveBeenCalledWith({
                msg: 'Internal Server Error',
                endpoint: { id: 'ep-uuid-10' },
                consumer: { id: 20 },
            });
            expect(result).toEqual(expectedError);
        });

        it('should find error using queryRunner repository when provided', async () => {
            const dto: GetServerErrorDto = {
                msg: 'Bad Gateway',
            };

            const customRepoMock = {
                findOneBy: jest.fn(async () => ({ id: 2n })),
            };
            const queryRunnerMock = {
                manager: {
                    getRepository: jest.fn(() => customRepoMock),
                },
            };

            const result = await service.getServerError(
                dto,
                queryRunnerMock as never,
            );

            expect(queryRunnerMock.manager.getRepository).toHaveBeenCalledWith(
                ServerError,
            );
            expect(customRepoMock.findOneBy).toHaveBeenCalled();
            expect(result).toEqual({ id: 2n });
        });
    });

    describe('addServerError', () => {
        it('should insert new server error', async () => {
            const dto: AddServerErrorDto = {
                endpointId: 'ep-uuid-5',
                consumerId: 6,
                errorCount: 1,
                msg: 'Error',
                type: 'InternalError',
                traceback: 'stack trace',
            };

            await service.addServerError(dto);

            expect(serverErrorsRepositoryMock.insert).toHaveBeenCalledWith({
                errorCount: 1,
                msg: 'Error',
                type: 'InternalError',
                traceback: 'stack trace',
                endpoint: { id: 'ep-uuid-5' },
                consumer: { id: 6 },
            });
        });
    });

    describe('updateServerErrorCount', () => {
        it('should increment error count', async () => {
            await service.updateServerErrorCount(100n, 5);

            expect(serverErrorsRepositoryMock.increment).toHaveBeenCalledWith(
                { id: 100n },
                'errorCount',
                5,
            );
        });
    });

    describe('deleteServerError', () => {
        it('should delete server error by id', async () => {
            await service.deleteServerError(100n);

            expect(serverErrorsRepositoryMock.delete).toHaveBeenCalledWith({
                id: 100n,
            });
        });
    });
});
