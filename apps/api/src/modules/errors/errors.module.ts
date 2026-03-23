import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorMetric } from './entities/error-metric.entity.js';
import { ValidationError } from './entities/validation-error.entity.js';
import { ServerError } from './entities/server-error.entity.js';
import { EndpointsModule } from '../endpoints/endpoints.module.js';
import { TrafficModule } from '../traffic/traffic.module.js';
import { RequestLogsModule } from '../request-logs/request-logs.module.js';
import { ErrorsController } from './errors.controller.js';
import { Repositories } from '../../common/constants/repositories.constant.js';
import { ErrorsRepository } from './repositories/errors.repository.js';
import { Services } from '../../common/constants/services.constant.js';
import { ErrorsService } from './errors.service.js';
import { ValidationErrorsService } from './validation-errors.service.js';
import { ServerErrorsService } from './server-errors.service.js';

@Module({
    imports: [
        TypeOrmModule.forFeature([ErrorMetric, ValidationError, ServerError]),
        EndpointsModule,
        RequestLogsModule,
        forwardRef(() => TrafficModule),
    ],
    controllers: [ErrorsController],
    providers: [
        {
            provide: Repositories.ERRORS,
            useClass: ErrorsRepository,
        },
        {
            provide: Services.ERRORS,
            useClass: ErrorsService,
        },
        {
            provide: Services.VALIDATION_ERRORS,
            useClass: ValidationErrorsService,
        },
        {
            provide: Services.SERVER_ERRORS,
            useClass: ServerErrorsService,
        },
    ],
    exports: [
        Repositories.ERRORS,
        Services.VALIDATION_ERRORS,
        Services.SERVER_ERRORS,
    ],
})
export class ErrorsModule {}
