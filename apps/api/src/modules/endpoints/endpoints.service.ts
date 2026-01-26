import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IEndpointsService } from './interfaces/endpoints-service.interface.js';
import type { NullableType } from '../../common/types/nullable.type.js';
import { Endpoint } from './entities/endpoint.entity.js';
import type { UpdateEndpointConfigDto } from './dto/update-endpoint-config.dto.js';
import type { UpdateEndpointErrorConfigDto } from './dto/update-endpoint-error-config.dto.js';
import type { EndpointConfigResponseDto } from './dto/endpoint-config-response.dto.js';
import type { RestfulMethods } from '../../common/enums/restful-methods.enum.js';

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
        method: RestfulMethods,
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

        const currentStatusCodes = endpoint.expectedStatusCodes ?? [];
        let newStatusCodes: number[];

        if (updateEndpointErrorConfigDto.expected) {
            if (
                currentStatusCodes.includes(
                    updateEndpointErrorConfigDto.statusCode,
                )
            ) {
                newStatusCodes = currentStatusCodes;
            } else {
                newStatusCodes = [
                    ...currentStatusCodes,
                    updateEndpointErrorConfigDto.statusCode,
                ];
            }
        } else {
            newStatusCodes = currentStatusCodes.filter(
                (code) => code !== updateEndpointErrorConfigDto.statusCode,
            );
        }

        if (newStatusCodes !== currentStatusCodes) {
            endpoint.expectedStatusCodes = newStatusCodes;
            await this.saveEndpoint(endpoint);
        }
    }
}
