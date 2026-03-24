import type { QueryRunner } from 'typeorm';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { AddValidationErrorDto } from '../dto/add-validation-error.dto.js';
import type { GetValidationErrorDto } from '../dto/get-validation-error.dto.js';
import type { ValidationError } from '../entities/validation-error.entity.js';
import type { NullableType } from '../../../common/types/nullable.type.js';

export interface IValidationErrorsService {
    /**
     * Get validation errors table
     * @param getErrorOptionsDto
     * @returns {Promise<ValidationErrorsTableResponseDto>[]}
     */
    getValidationErrorsTable(
        getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]>;
    /**
     * Get validation error
     * @param getValidationErrorDto
     * @param queryRunner
     * @returns {Promise<NullableType<ValidationError>>}
     */
    getValidationError(
        getValidationErrorDto: GetValidationErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<NullableType<ValidationError>>;
    /**
     * Add validation error
     * @param addValidationErrorDto
     * @param queryRunner
     * @returns {Promise<void>}
     */
    addValidationError(
        addValidationErrorDto: AddValidationErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Update validation error count
     * @param id
     * @param currentErrorCount
     * @param queryRunner
     * @returns {Promise<void>}
     */
    updateValidationErrorCount(
        id: bigint,
        currentErrorCount: number,
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Delete validation error
     * @param id
     * @param queryRunner
     * @returns {Promise<void>}
     */
    deleteValidationError(id: bigint, queryRunner?: QueryRunner): Promise<void>;
}
