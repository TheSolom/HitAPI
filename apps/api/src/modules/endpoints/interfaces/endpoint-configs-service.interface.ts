import type { UpdateEndpointConfigDto } from '../dto/update-endpoint-config.dto.js';
import type { UpdateEndpointErrorConfigDto } from '../dto/update-endpoint-error-config.dto.js';
import type { EndpointConfigResponseDto } from '../dto/endpoint-config-response.dto.js';
import type { RestfulMethods } from '../../../common/enums/restful-methods.enum.js';

export interface IEndpointConfigsService {
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
        method: RestfulMethods,
        path: string,
    ): Promise<EndpointConfigResponseDto>;
    /**
     * Get endpoint expected status codes by method and path
     *
     * @param appId
     * @param method
     * @param path
     * @returns {Promise<number[]>}
     * @throws {NotFoundException} Endpoint not found
     */
    getExpectedStatusCodes(
        appId: string,
        method: RestfulMethods,
        path: string,
    ): Promise<number[]>;
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
