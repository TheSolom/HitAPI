import type { NullableType } from '../../../common/types/nullable.type.js';
import { User } from '../entities/user.entity.js';
import { FindUserOptions } from './find-user-options.interface.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';
import { SocialAccount } from '../entities/social-account.entity.js';

export interface IUsersService {
    /**
     * Finds a user by their ID.
     * @param id The ID of the user to find.
     * @param options Optional options to include additional data.
     * @returns {Promise<NullableType<User>>} A Promise that resolves to the found User or null if not found.
     */
    findById(
        id: string,
        options?: FindUserOptions,
    ): Promise<NullableType<User>>;
    /**
     * Finds a user by their email.
     * @param email The email of the user to find.
     * @param options Optional options to include additional data.
     * @returns {Promise<NullableType<User>>} A Promise that resolves to the found User or null if not found.
     */
    findByEmail(
        email: string,
        options?: FindUserOptions,
    ): Promise<NullableType<User>>;
    /**
     * Finds all social accounts associated with a specific user.
     * @param userId The ID of the user.
     * @returns {Promise<SocialAccount[]>} A Promise that resolves to an array of SocialAccount entities.
     */
    findUserSocialAccounts(userId: string): Promise<SocialAccount[]>;
    /**
     * Creates a new user.
     * @param createUserDto The data transfer object containing user creation details.
     * @returns {Promise<User>} A Promise that resolves to the newly created User.
     */
    createUser(createUserDto: CreateUserDto): Promise<User>;
    /**
     * Updates an existing user.
     * @param id The ID of the user to update.
     * @param payload The data transfer object containing user update details.
     * @returns {Promise<User>} A Promise that resolves to the updated User.
     */
    updateUser(id: User['id'], payload: UpdateUserDto): Promise<User>;
    /**
     * Deletes a user by their ID.
     * @param id The ID of the user to delete.
     * @returns {Promise<void>} A Promise that resolves when the user is successfully deleted.
     */
    deleteUser(id: User['id']): Promise<void>;
    /**
     * Saves a user entity. This can be used for both creating and updating.
     * @param user The user entity to save.
     * @returns {Promise<User>} A Promise that resolves to the saved User entity.
     */
    saveUser(user: User): Promise<User>;
}
