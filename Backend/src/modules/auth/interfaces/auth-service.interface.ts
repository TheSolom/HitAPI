import { EmailLoginDto } from '../dto/email-login.dto.js';
import { AuthenticatedUser } from '../../users/dto/auth-user.dto.js';

export interface IAuthService {
    /**
     * Validates user credentials for email-based login.
     * @param loginDto - Data transfer object containing user's email and password.
     * @returns {Promise<AuthenticatedUser>} A promise that resolves to an AuthenticatedUser object if validation is successful.
     */
    validateUser(loginDto: EmailLoginDto): Promise<AuthenticatedUser>;
}
