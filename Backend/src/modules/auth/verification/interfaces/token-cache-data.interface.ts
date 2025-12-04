import { MailSubjects } from '../../../mails/enums/mails.enum.js';
import { User } from '../../../users/entities/user.entity.js';

export interface TokenCacheData {
    email: User['email'];
    displayName: User['displayName'];
    subject: MailSubjects;
}
