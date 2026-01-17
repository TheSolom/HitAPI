import type { AuthenticatedUser } from '../../modules/users/dto/auth-user.dto.js';
import type { App } from '../../modules/apps/entities/app.entity.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
        userApp?: App;
    }
}
