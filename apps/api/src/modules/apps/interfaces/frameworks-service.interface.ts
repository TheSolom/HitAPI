import type { Framework } from '../entities/framework.entity.js';
import type { CreateFrameworkDto } from '../dto/create-framework.dto.js';
import type { UpdateFrameworkDto } from '../dto/update-framework.dto.js';
import { NullableType } from '@hitapi/types';

export interface IFrameworksService {
    /**
     * Find all frameworks
     *
     * @returns {Promise<Framework[]>}
     */
    findAll(): Promise<Framework[]>;
    /**
     * Find one framework by id
     *
     * @param id
     * @returns {Promise<NullableType<Framework>>}
     */
    findById(id: number): Promise<NullableType<Framework>>;
    /**
     * Find one framework by name
     *
     * @param name
     * @returns {Promise<NullableType<Framework>>}
     */
    findByName(name: string): Promise<NullableType<Framework>>;
    /**
     * Create a new framework
     *
     * @param createFrameworkDto
     * @returns {Promise<Framework>}
     */
    create(createFrameworkDto: CreateFrameworkDto): Promise<Framework>;
    /**
     * Update a framework
     *
     * @param id
     * @param updateFrameworkDto
     * @returns {Promise<Framework>}
     */
    update(
        id: number,
        updateFrameworkDto: UpdateFrameworkDto,
    ): Promise<Framework>;
    /**
     * Delete a framework
     *
     * @param id
     * @returns {Promise<void>}
     */
    delete(id: number): Promise<void>;
}
