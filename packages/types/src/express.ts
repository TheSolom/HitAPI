import type { ConsumerInfo } from './consumer.js';
import type { AuthenticatedUser } from './auth-user.js';
import type { UserApp } from './user-app.js';

declare module 'express-serve-static-core' {
    interface Request {
        user?: AuthenticatedUser;
        userApp?: UserApp;
        consumer?: ConsumerInfo | string;
    }
}

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | { [x: string]: JSONValue }
    | JSONValue[];
