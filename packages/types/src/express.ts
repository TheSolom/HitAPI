import type { ConsumerInfo } from './consumer.ts';
import type { AuthenticatedUser } from './auth-user.ts';
import type { UserApp } from './user-app.ts';

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
