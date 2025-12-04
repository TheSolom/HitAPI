import { RegistrationDto } from '../dto/registration.dto.js';
import { LoginTokensDto } from '../../tokens/dto/login-tokens.dto.js';

export interface IRegistrationService {
    /**
     * Registers a new user with the provided registration details.
     * @param registerDto The data transfer object containing user registration information.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object with a success message.
     */
    registerUser(registerDto: RegistrationDto): Promise<{ message: string }>;
    /**
     * Verifies a user's email address using a verification token.
     * @param token The verification token received by the user.
     * @param deviceInfo Optional information about the device used for verification.
     * @param ipAddress Optional IP address from which the verification request originated.
     * @returns {Promise<LoginTokensDto>} A promise that resolves to a LoginTokensDto containing access and refresh tokens upon successful verification.
     */
    verifyEmail(
        token: string,
        deviceInfo?: string,
        ipAddress?: string,
    ): Promise<LoginTokensDto>;
    /**
     * Resend a new email verification link to the specified email address.
     * @param email The email address to which the verification email should be resent.
     * @returns {Promise<{ message: string }>} A promise that resolves to an object with a success message.
     */
    resendVerificationEmail(email: string): Promise<{ message: string }>;
}
