import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ValidationErrorsTableResponseDto } from '../dto/validation-errors-table-response.dto.js';

export interface IValidationErrorsRepository {
    /**
     * Get validation errors table
     * @param criteria
     * @returns {Promise<ValidationErrorsTableResponseDto[]>}
     */
    getValidationErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ValidationErrorsTableResponseDto[]>;
}
