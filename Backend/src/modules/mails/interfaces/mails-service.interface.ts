import type { MailData } from '../types/mails.type.js';

export interface IMailsService {
    /**
     * Sends an email to confirm a user's email.
     * @param mailData - The mail data containing the recipient's information, confirmation token, and display name.
     * @returns {Promise<void>} A promise that resolves when the email has been sent.
     */
    emailConfirmation(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void>;
    /**
     * Sends an email for the password reset process.
     * @param mailData - The mail data containing the recipient's information, password reset token, and display name.
     * @returns {Promise<void>} A promise that resolves when the email has been sent.
     */
    passwordReset(
        mailData: MailData<{ token: string; displayName: string }>,
    ): Promise<void>;
    /**
     * Sends an email for the team invite process.
     * @param mailData - The mail data containing the recipient's information, invite token.
     * @returns {Promise<void>} A promise that resolves when the email has been sent.
     */
    teamInvite(mailData: MailData<{ token: string }>): Promise<void>;
}
