import { SendMailOptions } from 'nodemailer';

export interface IMailerService {
    /**
     * Sends an email using a specified template and context.
     * @param options - An object containing mail options, template path, and context.
     * @param options.templatePath - The path to the email template file.
     * @param options.context - An object containing data to be passed to the email template.
     * @param options.mailOptions - Other Nodemailer `SendMailOptions` such as to, from, subject, etc.
     * @returns {Promise<void>} A Promise that resolves when the email has been sent.
     */
    sendMail({
        templatePath,
        context,
        ...mailOptions
    }: SendMailOptions & {
        templatePath: string;
        context: Record<string, unknown>;
    }): Promise<void>;
}
