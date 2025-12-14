import type { NullableType } from '../../../common/@types/nullable.type.js';
import { App } from '../entities/app.entity.js';
import { CreateAppDto } from '../dto/create-app.dto.js';
import { UpdateAppDto } from '../dto/update-app.dto.js';

export interface IAppsService {
    /**
     * Find all apps by team
     *
     * @param teamId
     * @returns {Promise<App[]>}
     */
    findAllByTeam(teamId: string): Promise<App[]>;
    /**
     * Find one app by id
     *
     * @param id
     * @returns {Promise<NullableType<App>>}
     */
    findOne(id: string): Promise<NullableType<App>>;
    /**
     * Create a new app
     *
     * @param createAppDto
     * @returns {Promise<App>}
     * @throws {ConflictException} App already exists
     */
    createApp(createAppDto: CreateAppDto): Promise<App>;
    /**
     * Update an app
     *
     * @param id
     * @param updateAppDto
     * @returns {Promise<App>}
     * @throws {NotFoundException} App not found
     */
    updateApp(id: string, updateAppDto: UpdateAppDto): Promise<App>;
    /**
     * Delete an app
     *
     * @param id
     * @returns {Promise<void>}
     */
    deleteApp(id: string): Promise<void>;
}
