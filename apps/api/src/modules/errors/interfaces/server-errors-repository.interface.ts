import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';

export interface IServerErrorsRepository {
    /**
     * Get server errors table
     * @param criteria
     * @returns {Promise<ServerErrorsTableResponseDto[]>}
     */
    getServerErrorsTable(
        criteria: GetValidationAndServerErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]>;
}
