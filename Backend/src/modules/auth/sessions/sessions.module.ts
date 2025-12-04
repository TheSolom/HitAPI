import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../tokens/entities/refresh-token.entity.js';
import { SessionsController } from './sessions.controller.js';
import { Services } from '../../../common/constants/services.constant.js';
import { SessionsService } from './sessions.service.js';

@Module({
    imports: [TypeOrmModule.forFeature([RefreshToken])],
    controllers: [SessionsController],
    providers: [
        {
            provide: Services.SESSIONS,
            useClass: SessionsService,
        },
    ],
    exports: [Services.SESSIONS],
})
export class SessionsModule {}
