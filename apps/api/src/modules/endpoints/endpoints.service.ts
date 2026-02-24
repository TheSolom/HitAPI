import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryRunner } from 'typeorm';
import type { IEndpointsService } from './interfaces/endpoints-service.interface.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { Endpoint } from './entities/endpoint.entity.js';
import type { CreateEndpointDto } from './dto/create-endpoint.dto.js';

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
        queryRunner?: QueryRunner,
    ): Promise<Endpoint[]> {
        const repository =
            queryRunner?.manager.getRepository(Endpoint) ??
            this.endpointsRepository;

        return repository.find({
            where: { app: { id: appId } },
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
            ...createEndpointDto,
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
