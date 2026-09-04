import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ValidationErrorsService } from '../validation-errors.service.js';
import { ValidationError } from '../entities/validation-error.entity.js';
import { Repositories } from '../../../common/constants/repositories.constant.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { GetValidationErrorDto } from '../dto/get-validation-error.dto.js';
import type { AddValidationErrorDto } from '../dto/add-validation-error.dto.js';

describe('ValidationErrorsService', () => {
    let service: ValidationErrorsService;
    let errorsRepositoryMock: {
        getValidationErrorsTable: jest.Mock<any>;
    };
    let validationErrorsRepositoryMock: {
        findOneBy: jest.Mock<any>;
        insert: jest.Mock<any>;
        increment: jest.Mock<any>;
        delete: jest.Mock<any>;
    };

    beforeEach(async () => {
        errorsRepositoryMock = {
            getValidationErrorsTable: jest.fn(),
        };

        validationErrorsRepositoryMock = {
            findOneBy: jest.fn(),
            insert: jest.fn(),
            increment: jest.fn(),
            delete: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ValidationErrorsService,
                {
                    provide: Repositories.ERRORS,
                    useValue: errorsRepositoryMock,
                },
                {
                    provide: getRepositoryToken(ValidationError),
                    useValue: validationErrorsRepositoryMock,
                },
            ],
        }).compile();

        service = module.get<ValidationErrorsService>(ValidationErrorsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getValidationErrorsTable', () => {
        it('should delegate to errors repository', async () => {
            const dto: GetValidationAndServerErrorOptionsDto = {
                appId: 'app-uuid-1',
            } as GetValidationAndServerErrorOptionsDto;

            errorsRepositoryMock.getValidationErrorsTable.mockResolvedValue([
                { id: '1', field: 'email', message: 'Invalid email' },
            ]);

            const result = await service.getValidationErrorsTable(dto);

            expect(
                errorsRepositoryMock.getValidationErrorsTable,
            ).toHaveBeenCalledWith(dto);
            expect(result).toEqual([
                { id: '1', field: 'email', message: 'Invalid email' },
            ]);
        });
    });

    describe('getValidationError', () => {
        it('should find validation error with serialized loc', async () => {
            const dto: GetValidationErrorDto = {
                endpointId: 'ep-uuid-10',
                consumerId: 20,
                loc: ['body', 'email'],
                msg: 'Required',
                type: 'value_error',
            };

            const expected = { id: 1n, msg: 'Required' };
            validationErrorsRepositoryMock.findOneBy.mockResolvedValue(
                expected,
            );

            const result = await service.getValidationError(dto);

            expect(
                validationErrorsRepositoryMock.findOneBy,
            ).toHaveBeenCalledWith({
                msg: 'Required',
                type: 'value_error',
                loc: JSON.stringify(['body', 'email']),
                endpoint: { id: 'ep-uuid-10' },
                consumer: { id: 20 },
            });
            expect(result).toEqual(expected);
        });

        it('should find validation error using queryRunner repository when provided', async () => {
            const dto = {
                msg: 'Required',
                type: 'value_error',
            };

            const customRepoMock = {
                findOneBy: jest.fn(async () => ({ id: 2n })),
            };
            const queryRunnerMock = {
                manager: {
                    getRepository: jest.fn(() => customRepoMock),
                },
            };

            const result = await service.getValidationError(
                dto,
                queryRunnerMock as never,
            );

            expect(queryRunnerMock.manager.getRepository).toHaveBeenCalledWith(
                ValidationError,
            );
            expect(customRepoMock.findOneBy).toHaveBeenCalled();
            expect(result).toEqual({ id: 2n });
        });
    });

    describe('addValidationError', () => {
        it('should insert new validation error', async () => {
            const dto: AddValidationErrorDto = {
                endpointId: 'ep-uuid-5',
                consumerId: 6,
                errorCount: 1,
                msg: 'Required',
                type: 'value_error',
                loc: ['body', 'email'],
            };

            await service.addValidationError(dto);

            expect(validationErrorsRepositoryMock.insert).toHaveBeenCalledWith({
                errorCount: 1,
                msg: 'Required',
                type: 'value_error',
                loc: ['body', 'email'],
                endpoint: { id: 'ep-uuid-5' },
                consumer: { id: 6 },
            });
        });
    });

    describe('updateValidationErrorCount', () => {
        it('should increment validation error count', async () => {
            await service.updateValidationErrorCount(50n, 3);

            expect(
                validationErrorsRepositoryMock.increment,
            ).toHaveBeenCalledWith({ id: 50n }, 'errorCount', 3);
        });
    });

    describe('deleteValidationError', () => {
        it('should delete validation error by id', async () => {
            await service.deleteValidationError(50n);

            expect(validationErrorsRepositoryMock.delete).toHaveBeenCalledWith({
                id: 50n,
            });
        });
    });
});
