import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IEndpointsService } from './interfaces/endpoints-service.interface.js';
import type { NullableType } from '../../common/@types/nullable.type.js';
import { Endpoint } from './entities/endpoint.entity.js';
import type { UpdateEndpointConfigDto } from './dto/update-endpoint-config.dto.js';
import type { UpdateEndpointErrorConfigDto } from './dto/update-endpoint-error-config.dto.js';
import type { EndpointConfigResponseDto } from './dto/endpoint-config-response.dto.js';

@Injectable()
export class EndpointsService implements IEndpointsService {
    constructor(
        @InjectRepository(Endpoint)
        private readonly endpointsRepository: Repository<Endpoint>,
    ) {}

    private async saveEndpoint(endpoint: Endpoint): Promise<Endpoint> {
        return this.endpointsRepository.save(endpoint);
    }

    async findAllByApp(appId: string): Promise<Endpoint[]> {
        return this.endpointsRepository.find({
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

    async getConfig(
        appId: string,
        method: string,
        path: string,
    ): Promise<EndpointConfigResponseDto> {
        const endpoint = await this.endpointsRepository.findOne({
            where: { app: { id: appId }, method, path },
        });

        if (!endpoint) {
            throw new NotFoundException('Endpoint not found');
        }

        return {
            excluded: endpoint.excluded,
            targetResponseTimeMs: endpoint.targetResponseTimeMs,
        };
    }

    async updateConfig(
        appId: string,
        updateEndpointConfigDto: UpdateEndpointConfigDto,
    ): Promise<void> {
        const endpoint = await this.endpointsRepository.findOne({
            where: {
                app: { id: appId },
                method: updateEndpointConfigDto.method,
                path: updateEndpointConfigDto.path,
            },
        });

        if (!endpoint) {
            throw new NotFoundException('Endpoint not found');
        }

        const updated = this.endpointsRepository.merge(endpoint, {
            ...(updateEndpointConfigDto.excluded && {
                excluded: updateEndpointConfigDto.excluded,
            }),
            ...(updateEndpointConfigDto.targetResponseTimeMs && {
                targetResponseTimeMs:
                    updateEndpointConfigDto.targetResponseTimeMs,
            }),
        });

        await this.saveEndpoint(updated);
    }

    async updateErrorConfig(
        appId: string,
        updateEndpointErrorConfigDto: UpdateEndpointErrorConfigDto,
    ): Promise<void> {
        const endpoint = await this.endpointsRepository.findOne({
            where: {
                app: { id: appId },
                method: updateEndpointErrorConfigDto.method,
                path: updateEndpointErrorConfigDto.path,
            },
        });

        if (!endpoint) {
            throw new NotFoundException('Endpoint not found');
        }

        // TODO: Implement error config update logic.
        // Note: Error config handling would typically involve a separate entity
        // for tracking expected status codes. This is a placeholder implementation.
        // The actual implementation depends on how the endpoint error expectations
        // should be stored (e.g., a separate EndpointErrorConfig entity or JSON column).
        // For now, we just validate the endpoint exists.
    }
}
