import type { AuthenticatedUser } from '../../modules/users/dto/auth-user.dto.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
    }
}
