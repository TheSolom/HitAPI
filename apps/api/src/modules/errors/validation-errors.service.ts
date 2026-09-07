import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryRunner } from 'typeorm';
import type { NullableType } from '@hitapi/types';
import { Repositories } from '../../common/constants/repositories.constant.js';
import type { IValidationErrorsRepository } from './interfaces/validation-errors-repository.interface.js';
import type { IValidationErrorsService } from './interfaces/validation-errors-service.interface.js';
import { ValidationError } from './entities/validation-error.entity.js';
import type { GetValidationAndServerErrorOptionsDto } from './dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from './dto/validation-errors-table-response.dto.js';
import type { GetValidationErrorDto } from './dto/get-validation-error.dto.js';
import type { AddValidationErrorDto } from './dto/add-validation-error.dto.js';

@Injectable()
export class ValidationErrorsService implements IValidationErrorsService {
    constructor(
        @Inject(Repositories.VALIDATION_ERRORS)
        private readonly validationErrorsCustomRepository: IValidationErrorsRepository,
        @InjectRepository(ValidationError)
        private readonly validationErrorsRepository: Repository<ValidationError>,
    ) {}

    async getValidationErrorsTable(
        getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]> {
        return this.validationErrorsCustomRepository.getValidationErrorsTable(
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

        const { endpointId, consumerId, loc, ...rest } = getValidationErrorDto;

        return repository.findOneBy({
            ...rest,
            loc: loc ? JSON.stringify(loc) : undefined,
            endpoint: endpointId ? { id: endpointId } : undefined,
            consumer: consumerId ? { id: consumerId } : undefined,
        });
    }

    async addValidationError(
        addValidationErrorDto: AddValidationErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ValidationError) ??
            this.validationErrorsRepository;

        const { endpointId, consumerId, ...rest } = addValidationErrorDto;

        await repository.insert({
            ...rest,
            endpoint: { id: endpointId },
            consumer: consumerId ? { id: consumerId } : undefined,
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
