import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryRunner } from 'typeorm';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { IErrorsRepository } from './interfaces/errors-repository.interface.js';
import { ValidationError } from './entities/validation-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from './dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from './dto/validation-errors-table-response.dto.js';
import type { GetValidationErrorDto } from './dto/get-validation-error.dto.js';
import type { AddValidationErrorDto } from './dto/add-validation-error.dto.js';
import type { NullableType } from './../../common/types/nullable.type.js';

@Injectable()
export class ValidationErrorsService {
    constructor(
        @Inject(Repositories.ERRORS)
        private readonly errorsRepository: IErrorsRepository,
        @InjectRepository(ValidationError)
        private readonly validationErrorsRepository: Repository<ValidationError>,
    ) {}

    async getValidationErrorsTable(
        getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]> {
        return this.errorsRepository.getValidationErrorsTable(
            getErrorOptionsDto,
        );
    }

    async getValidationError(
        getValidationErrorDto: GetValidationErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<NullableType<ValidationError>> {
        const repository =
            queryRunner?.manager.getRepository(ValidationError) ??
            this.validationErrorsRepository;

        return repository.findOneBy({
            ...getValidationErrorDto,
            loc: JSON.stringify(getValidationErrorDto.loc),
            endpoint: getValidationErrorDto.endpointId
                ? { id: getValidationErrorDto.endpointId }
                : undefined,
            consumer: getValidationErrorDto.consumerId
                ? { id: getValidationErrorDto.consumerId }
                : undefined,
        });
    }

    async addValidationError(
        addValidationErrorDto: AddValidationErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ValidationError) ??
            this.validationErrorsRepository;

        await repository.insert({
            ...addValidationErrorDto,
            endpoint: { id: addValidationErrorDto.endpointId },
            consumer: addValidationErrorDto.consumerId
                ? { id: addValidationErrorDto.consumerId }
                : undefined,
        });
    }

    async updateValidationErrorCount(
        id: bigint,
        currentErrorCount: number,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ValidationError) ??
            this.validationErrorsRepository;

        await repository.increment({ id }, 'errorCount', currentErrorCount);
    }

    async deleteValidationError(
        id: bigint,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ValidationError) ??
            this.validationErrorsRepository;

        await repository.delete({ id });
    }
}
