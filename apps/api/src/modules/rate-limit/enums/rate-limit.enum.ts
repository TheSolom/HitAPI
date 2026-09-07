export enum RateLimitType {
    EMAIL_VERIFICATION = 'EMAIL_VERIFICATION',
    PASSWORD_RESET = 'PASSWORD_RESET',
    LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
    API_CALL = 'API_CALL',
}

export enum RateLimitTracker {
    IP = 'IP',
    APP = 'APP',
    USER = 'USER',
    CUSTOM = 'CUSTOM',
}
