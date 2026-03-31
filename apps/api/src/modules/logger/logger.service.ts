import { Injectable, Scope, Inject, LoggerService } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { INQUIRER } from '@nestjs/core';
import type { Logger } from 'winston';
import type { ClsService } from 'nestjs-cls';
import type { AppClsStore, LogMeta } from './interfaces/logger.interface.js';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService implements LoggerService {
    private context?: string;

    constructor(
        @Inject(INQUIRER)
        private readonly parentClass: object,
        @Inject(WINSTON_MODULE_PROVIDER)
        private readonly logger: Logger,
        private readonly cls: ClsService<AppClsStore>,
    ) {
        this.context = this.parentClass?.constructor?.name;
    }

    setContext(context: string): void {
        this.context = context;
    }

    private processMeta(metaOrContext?: LogMeta | string): LogMeta {
        const meta: LogMeta =
            typeof metaOrContext === 'string'
                ? { context: metaOrContext }
                : { ...metaOrContext };

        return {
            context: meta?.context ?? this.context,
            traceId:
                meta?.traceId ?? this.cls.getId() ?? this.cls.get('traceId'),
            ...meta,
        };
    }

    verbose(message: string, metaOrContext?: LogMeta | string): void {
        this.logger.verbose(message, this.processMeta(metaOrContext));
    }

    debug(message: string, metaOrContext?: LogMeta | string): void {
        this.logger.debug(message, this.processMeta(metaOrContext));
    }

    info(message: string, metaOrContext?: LogMeta | string): void {
        this.logger.info(message, this.processMeta(metaOrContext));
    }

    log(message: string, metaOrContext?: LogMeta | string): void {
        this.logger.info(message, this.processMeta(metaOrContext));
    }

    warn(message: string, metaOrContext?: LogMeta | string): void {
        this.logger.warn(message, this.processMeta(metaOrContext));
    }

    error(
        message: string,
        metaOrContext?: LogMeta | string | Error['stack'],
    ): void {
        if (metaOrContext instanceof Error) {
            this.logger.error(
                message,
                this.processMeta({
                    error: metaOrContext.stack,
                }),
            );
        } else {
            this.logger.error(message, this.processMeta(metaOrContext));
        }
    }
}
