import { SetMetadata } from '@nestjs/common';

export const SKIP_RESPONSE_INTERCEPTOR = 'SKIP_RESPONSE_INTERCEPTOR';
export const SkipResponseInterceptor = () =>
    SetMetadata(SKIP_RESPONSE_INTERCEPTOR, true);
