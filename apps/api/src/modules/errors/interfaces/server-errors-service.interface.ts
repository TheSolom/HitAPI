import type { QueryRunner } from 'typeorm';
import type { ServerErrorsTableResponseDto } from '../dto/server-errors-table-response.dto.js';
import type { GetValidationAndServerErrorOptionsDto } from '../dto/get-validation-and-server-error-options.dto.js';
import type { AddServerErrorDto } from '../dto/add-server-error.dto.js';
import type { GetServerErrorDto } from '../dto/get-server-error.dto.js';
import type { ServerError } from '../entities/server-error.entity.js';
import type { NullableType } from '../../../common/types/nullable.type.js';

export interface IServerErrorsService {
    /**
     * Get server errors table
     * @param getErrorOptionsDto
     * @returns {Promise<ServerErrorsTableResponseDto[]>}
     */
    getServerErrorsTable(
        getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]>;
    /**
     * Get server error
     * @param getServerErrorDto
     * @param queryRunner
     * @returns {Promise<NullableType<ServerError>>}
     */
    getServerError(
        getServerErrorDto: GetServerErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<NullableType<ServerError>>;
    /**
     * Add server error
     * @param addServerErrorDto
     * @param queryRunner
     * @returns {Promise<void>}
     */
    addServerError(
        addServerErrorDto: AddServerErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Update server error count
     * @param id
     * @param currentErrorCount
     * @param queryRunner
     * @returns {Promise<void>}
     */
    updateServerErrorCount(
        id: bigint,
        currentErrorCount: number,
        queryRunner?: QueryRunner,
    ): Promise<void>;
    /**
     * Delete server error
     * @param id
     * @param queryRunner
     * @returns {Promise<void>}
     */
    deleteServerError(id: bigint, queryRunner?: QueryRunner): Promise<void>;
}
