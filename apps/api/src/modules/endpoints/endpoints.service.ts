import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Repository,
    ILike,
    type QueryRunner,
    type FindOptionsWhere,
} from 'typeorm';
import type { NullableType } from '@hitapi/types';
import type { IEndpointsService } from './interfaces/endpoints-service.interface.js';
import { Endpoint } from './entities/endpoint.entity.js';
import type { CreateEndpointDto } from './dto/create-endpoint.dto.js';
import type { GetEndpointsOptionsDto } from './dto/get-endpoints-options.dto.js';

@Injectable()
export class EndpointsService implements IEndpointsService {
    constructor(
        @InjectRepository(Endpoint)
        private readonly endpointsRepository: Repository<Endpoint>,
    ) {}

    private async saveEndpoint(endpoint: Endpoint): Promise<Endpoint> {
        return this.endpointsRepository.save(endpoint);
    }

    async findAllByApp(
        appId: string,
        options?: GetEndpointsOptionsDto,
        queryRunner?: QueryRunner,
    ): Promise<Endpoint[]> {
        const repository =
            queryRunner?.manager.getRepository(Endpoint) ??
            this.endpointsRepository;

        let whereCondition:
            FindOptionsWhere<Endpoint> | FindOptionsWhere<Endpoint>[];

        if (options?.search) {
            whereCondition = [
                { app: { id: appId }, path: ILike(`%${options.search}%`) },
                { app: { id: appId }, summary: ILike(`%${options.search}%`) },
                {
                    app: { id: appId },
                    description: ILike(`%${options.search}%`),
                },
            ];
        } else {
            whereCondition = { app: { id: appId } };
        }

        return repository.find({
            where: whereCondition,
            order: { path: 'ASC', method: 'ASC' },
        });
    }

    async findOne(
        appId: string,
        endpointId: string,
    ): Promise<NullableType<Endpoint>> {
        return this.endpointsRepository.findOne({
            where: { id: endpointId, app: { id: appId } },
        });
    }

    async create(
        appId: string,
        createEndpointDto: CreateEndpointDto,
    ): Promise<Endpoint> {
        const endpoint = this.endpointsRepository.create({
            app: { id: appId },
            method: createEndpointDto.method,
            path: createEndpointDto.path,
            summary: createEndpointDto.summary,
            description: createEndpointDto.description,
            targetResponseTimeMs: createEndpointDto.targetResponseTimeMs,
            excluded: createEndpointDto.excluded,
        });

        return this.saveEndpoint(endpoint);
    }

    async restore(appId: string, endpointId: string): Promise<void> {
        await this.endpointsRepository.restore({
            id: endpointId,
            app: { id: appId },
        });
    }

    async remove(appId: string, endpointId: string): Promise<void> {
        await this.endpointsRepository.softDelete({
            id: endpointId,
            app: { id: appId },
        });
    }
}
