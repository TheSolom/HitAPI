import type { NullableType } from '@hitapi/types';
import type { Endpoint } from '../entities/endpoint.entity.js';
import type { CreateEndpointDto } from '../dto/create-endpoint.dto.js';
import type { QueryRunner } from 'typeorm';
import type { GetEndpointsOptionsDto } from '../dto/get-endpoints-options.dto.js';

export interface IEndpointsService {
    /**
     * Find all endpoints by app with optional search options
     *
     * @param appId
     * @param options
     * @param queryRunner
     * @returns {Promise<Endpoint[]>}
     */
    findAllByApp(
        appId: string,
        options?: GetEndpointsOptionsDto,
        queryRunner?: QueryRunner,
    ): Promise<Endpoint[]>;
    /**
     * Find one endpoint by id
     *
     * @param appId
     * @param endpointId
     * @returns {Promise<NullableType<Endpoint>>}
     */
    findOne(appId: string, endpointId: string): Promise<NullableType<Endpoint>>;
    /**
     * Create endpoint
     *
     * @param appId
     * @param createEndpointDto
     * @returns {Promise<Endpoint>}
     */
    create(
        appId: string,
        createEndpointDto: CreateEndpointDto,
    ): Promise<Endpoint>;
    /**
     * Restore deleted endpoint
     *
     * @param appId
     * @param endpointId
     * @returns {Promise<void>}
     */
    restore(appId: string, endpointId: string): Promise<void>;
    /**
     * Remove endpoint
     *
     * @param appId
     * @param endpointId
     * @returns {Promise<void>}
     */
    remove(appId: string, endpointId: string): Promise<void>;
}
