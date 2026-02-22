import type { ConsumerMethodPath } from './requests.js';

export type ValidationErrorsItem = ConsumerMethodPath & {
    msg: string;
    type: string;
    loc: string[];
    errorCount: number;
};

export type ServerErrorsItem = ConsumerMethodPath & {
    msg: string;
    type: string;
    traceback: string;
    errorCount: number;
};

type Error = {
    msg: string;
    type: string;
};

export type ValidationError = Error & {
    loc: string;
};

export type ServerError = Error & {
    traceback: string;
};
