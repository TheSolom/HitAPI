import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryRunner } from 'typeorm';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { ServerError } from './entities/server-error.entity.js';
import type { IErrorsRepository } from './interfaces/errors-repository.interface.js';
import type { GetValidationAndServerErrorOptionsDto } from './dto/get-validation-and-server-error-options.dto.js';
import type { ServerErrorsTableResponseDto } from './dto/server-errors-table-response.dto.js';
import type { GetServerErrorDto } from './dto/get-server-error.dto.js';
import type { AddServerErrorDto } from './dto/add-server-error.dto.js';
import type { NullableType } from '../../common/types/nullable.type.js';

@Injectable()
export class ServerErrorsService {
    constructor(
        @Inject(Repositories.ERRORS)
        private readonly errorsRepository: IErrorsRepository,
        @InjectRepository(ServerError)
        private readonly serverErrorsRepository: Repository<ServerError>,
    ) {}

    async getServerErrorsTable(
        getErrorOptionsDto: GetValidationAndServerErrorOptionsDto,
    ): Promise<ServerErrorsTableResponseDto[]> {
        return this.errorsRepository.getServerErrorsTable(getErrorOptionsDto);
    }

    async getServerError(
        getServerErrorDto: GetServerErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<NullableType<ServerError>> {
        const repository =
            queryRunner?.manager.getRepository(ServerError) ??
            this.serverErrorsRepository;

        return repository.findOneBy({
            ...getServerErrorDto,
            endpoint: getServerErrorDto.endpointId
                ? { id: getServerErrorDto.endpointId }
                : undefined,
            consumer: getServerErrorDto.consumerId
                ? { id: getServerErrorDto.consumerId }
                : undefined,
        });
    }

    async addServerError(
        addServerErrorDto: AddServerErrorDto,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ServerError) ??
            this.serverErrorsRepository;

        await repository.insert({
            ...addServerErrorDto,
            endpoint: { id: addServerErrorDto.endpointId },
            consumer: addServerErrorDto.consumerId
                ? { id: addServerErrorDto.consumerId }
                : undefined,
        });
    }

    async updateServerErrorCount(
        id: bigint,
        currentErrorCount: number,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ServerError) ??
            this.serverErrorsRepository;

        await repository.increment({ id }, 'errorCount', currentErrorCount);
    }

    async deleteServerError(
        id: bigint,
        queryRunner?: QueryRunner,
    ): Promise<void> {
        const repository =
            queryRunner?.manager.getRepository(ServerError) ??
            this.serverErrorsRepository;

        await repository.delete({ id });
    }
}
