import type { BaseJobData } from '../../ingestion/types/job-data.type.js';

export type EmailConfirmationJobData = BaseJobData & {
    to: string;
    token: string;
    displayName: string;
};

export type PasswordResetJobData = BaseJobData & {
    to: string;
    token: string;
    displayName: string;
};

export type TeamInviteJobData = BaseJobData & {
    to: string;
    token: string;
};

export type MailsJobData =
    EmailConfirmationJobData | PasswordResetJobData | TeamInviteJobData;
