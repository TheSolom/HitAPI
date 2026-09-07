import type { MailData } from '../types/mails.type.js';

export interface IMailsService {
    /**
     * Queues an email to confirm a user's email.
     * @param mailData - The mail data containing the recipient's information, confirmation token, and display name.
     * @returns {Promise<void>} A promise that resolves when the email job has been queued.
     */
    emailConfirmation(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void>;
    /**
     * Queues an email for the password reset process.
     * @param mailData - The mail data containing the recipient's information, password reset token, and display name.
     * @returns {Promise<void>} A promise that resolves when the email job has been queued.
     */
    passwordReset(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void>;
    /**
     * Queues an email for the team invite process.
     * @param mailData - The mail data containing the recipient's information, invite token.
     * @returns {Promise<void>} A promise that resolves when the email job has been queued.
     */
    teamInvite(mailData: MailData<{ token: string }>): Promise<void>;
}
