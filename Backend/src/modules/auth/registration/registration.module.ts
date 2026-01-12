import { Module } from '@nestjs/common';
import { UsersModule } from '../../users/users.module.js';
import { TokensModule } from '../tokens/tokens.module.js';
import { VerificationModule } from '../verification/verification.module.js';
import { RegistrationController } from './registration.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import { RegistrationService } from './registration.service.js';

@Module({
    imports: [UsersModule, TokensModule, VerificationModule],
    controllers: [RegistrationController],
    providers: [
        {
            provide: Services.REGISTRATION,
            useClass: RegistrationService,
        },
    ],
    exports: [Services.REGISTRATION],
})
export class RegistrationModule {}
