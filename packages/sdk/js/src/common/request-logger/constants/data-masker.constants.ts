export const MASK_QUERY_PARAM_PATTERNS = [
    /auth/i,
    /api-?key/i,
    /secret/i,
    /token/i,
    /password/i,
    /pwd/i,
] as const;
export const MASK_HEADER_PATTERNS = [
    /auth/i,
    /api-?key/i,
    /secret/i,
    /token/i,
    /cookie/i,
] as const;
export const MASK_BODY_FIELD_PATTERNS = [
    /password/i,
    /pwd/i,
    /token/i,
    /secret/i,
    /auth/i,
    /card[-_ ]?number/i,
    /ccv/i,
    /ssn/i,
] as const;
export const MASKED = '******';
