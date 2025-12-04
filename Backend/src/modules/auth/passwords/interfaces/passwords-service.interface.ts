import { ResetPasswordDto } from '../dto/reset-password.dto.js';

export interface IPasswordsService {
    /**
     * Initiates a password reset process by sending a reset token to the user's email
     * @param email - The email address of the user requesting password reset
     * @returns {Promise<{ message: string }>} A promise that resolves to an object containing a message
     */
    forgotPassword(email: string): Promise<{ message: string }>;
    /**
     * Resets a user's password using a valid reset token
     * @param token - The password reset token
     * @param newPassword - The new password to set
     * @throws {BadRequestException} if the token is invalid or expired
     * @throws {NotFoundException} if the user is not found or not verified
     * @returns {Promise<{ message: string }>} A promise that resolves to an object containing a message
     */
    resetPassword(
        resetPasswordDto: ResetPasswordDto,
    ): Promise<{ message: string }>;
    /**
     * Changes a user's password after verifying their current password
     * @param userId - The ID of the user
     * @param currentPassword - The user's current password for verification
     * @param newPassword - The new password to set
     * @throws {UnauthorizedException} if the current password is incorrect
     * @throws {BadRequestException} if the user has no password or if the new password is the same as the current one
     * @throws {NotFoundException} if the user is not found or not verified
     * @returns {Promise<{ message: string }>} A promise that resolves to an object containing a message
     */
    changePassword(
        userId: string,
        currentPassword: string,
        newPassword: string,
    ): Promise<{ message: string }>;
    /**
     * Sets a password for a user who doesn't have one yet
     * @param userId - The ID of the user
     * @param newPassword - The password to set
     * @throws {BadRequestException} if the user already has a password
     * @throws {NotFoundException} if the user is not found or not verified
     * @returns {Promise<{ message: string }>} A promise that resolves to an object containing a message
     */
    setPassword(
        userId: string,
        newPassword: string,
    ): Promise<{ message: string }>;
}
