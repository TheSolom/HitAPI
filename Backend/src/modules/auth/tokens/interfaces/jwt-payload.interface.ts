import { JwtPayload } from 'jsonwebtoken';
import { User } from '../../../users/entities/user.entity.js';

export interface IJwtPayload extends JwtPayload {
    sub: User['id'];
    email: User['email'];
    displayName: User['displayName'];
    isVerified: User['verified'];
    isAdmin: User['admin'];
}
