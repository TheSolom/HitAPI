import { Module, Global } from '@nestjs/common';
import { Services } from '../../common/constants/services.constant.js';
import { HashingService } from './hashing.service.js';

@Global()
@Module({
    providers: [
        {
            provide: Services.HASHING,
            useClass: HashingService,
        },
    ],
    exports: [Services.HASHING],
})
export class HashingModule {}
