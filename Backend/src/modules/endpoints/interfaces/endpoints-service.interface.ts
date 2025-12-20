import type { NullableType } from '../../../common/@types/nullable.type.js';
import type { Endpoint } from '../entities/endpoint.entity.js';
import type { UpdateEndpointConfigDto } from '../dto/update-endpoint-config.dto.js';
import type { UpdateEndpointErrorConfigDto } from '../dto/update-endpoint-error-config.dto.js';
import type { EndpointConfigResponseDto } from '../dto/endpoint-config-response.dto.js';

export interface IEndpointsService {
    /**
     * Find all endpoints by app
     *
     * @param appId
     * @returns {Promise<Endpoint[]>}
     */
    findAllByApp(appId: string): Promise<Endpoint[]>;

    /**
     * Find one endpoint by id
     *
     * @param appId
     * @param endpointId
     * @returns {Promise<NullableType<Endpoint>>}
     */
    findOne(appId: string, endpointId: string): Promise<NullableType<Endpoint>>;

    /**
     * Get endpoint configuration by method and path
     *
     * @param appId
     * @param method
     * @param path
     * @returns {Promise<EndpointConfigResponseDto>}
     * @throws {NotFoundException} Endpoint not found
     */
    getConfig(
        appId: string,
        method: string,
        path: string,
    ): Promise<EndpointConfigResponseDto>;

    /**
     * Update endpoint configuration
     *
     * @param appId
     * @param updateEndpointConfigDto
     * @returns {Promise<void>}
     * @throws {NotFoundException} Endpoint not found
     */
    updateConfig(
        appId: string,
        updateEndpointConfigDto: UpdateEndpointConfigDto,
    ): Promise<void>;

    /**
     * Update endpoint error configuration
     *
     * @param appId
     * @param updateEndpointErrorConfigDto
     * @returns {Promise<void>}
     * @throws {NotFoundException} Endpoint not found
     */
    updateErrorConfig(
        appId: string,
        updateEndpointErrorConfigDto: UpdateEndpointErrorConfigDto,
    ): Promise<void>;
}
