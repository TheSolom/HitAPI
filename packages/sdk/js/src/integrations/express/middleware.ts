import { setTimeout } from 'node:timers';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { getClientIp } from 'request-ip';
import type { ILayer } from 'express-serve-static-core';
import type {
    Express,
    Request,
    Response,
    NextFunction,
    Application,
    Router,
    RequestHandler,
} from 'express';
import type {
    LogRecord,
    JSONValue,
    ValidationError,
    StartupData,
    ConsumerInfo,
} from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';
import type { HitAPIConfig } from '../../common/types/config.js';
import { HitAPIClient } from '../../common/core/client.js';
import { getPackageVersion } from '../../common/core/package-versions.js';
import {
    patchConsole,
    patchWinston,
    patchPino,
} from '../../common/loggers/index.js';
import {
    isSupportedContentType,
    parseContentLength,
    convertBody,
    convertHeaders,
} from '../../common/utils/index.js';
import {
    getEndpoints,
    getRouterInfo,
    parseExpressPath,
    parseExpressPathRegExp,
} from './utils.js';
import { consumerFromStringOrObject } from '../../common/core/consumer-registry.js';

export function useHitAPI(
    app: Application | Router,
    config: HitAPIConfig & { basePath?: string },
): void {
    const client = HitAPIClient.init(config);
    app.use(getMiddleware(app, client));
    scheduleStartupData(app, client, config.basePath);
}

export function setConsumer(
    req: Request,
    consumer: ConsumerInfo | string,
): void {
    req.consumer = consumer;
}

function scheduleStartupData(
    app: Express | Router,
    client: HitAPIClient,
    basePath?: string,
    attempt = 1,
): void {
    setTimeout(() => {
        void (async () => {
            const appInfo = await getAppInfo(app, basePath);
            if (appInfo.paths.length > 0 || attempt >= 10) {
                client.setStartupData(appInfo);
                await client.startSync();
            } else {
                scheduleStartupData(app, client, basePath, attempt + 1);
            }
        })();
    }, 500);
}

async function getAppInfo(
    app: Express | Router,
    basePath = '',
): Promise<StartupData> {
    const [hitAPI, express, nestJS] = await Promise.allSettled(
        ['@hitapi/js', 'express', '@nestjs/core'].map(getPackageVersion),
    );

    const versions: Record<string, string> = {
        'node.js': process.versions.node,
    };
    if (hitAPI.status === 'fulfilled' && hitAPI.value)
        versions['@hitapi/js'] = hitAPI.value;
    if (express.status === 'fulfilled' && express.value)
        versions['express'] = express.value;
    if (nestJS.status === 'fulfilled' && nestJS.value)
        versions['@nestjs/core'] = nestJS.value;

    return {
        paths: getEndpoints(app, basePath),
        versions,
        client: 'js:express',
    };
}

function getMiddleware(
    app: Application | Router,
    client: HitAPIClient,
): RequestHandler {
    let errorHandlerConfigured = false;
    const logsContext = new AsyncLocalStorage<LogRecord[]>();

    if (client.requestLogger.config.captureLogs) {
        patchConsole(logsContext);
        void patchWinston(logsContext);
    }

    return (req: Request, res: Response, next: NextFunction) => {
        if (
            !client.enabled ||
            (req.method.toUpperCase() as RestfulMethod) ===
                RestfulMethod.OPTIONS
        ) {
            next();
            return;
        }

        if (!errorHandlerConfigured) {
            app.use(captureServerError);
            errorHandlerConfigured = true;
        }

        if (client.requestLogger.config.captureLogs && 'log' in req) {
            void patchPino(req.log, logsContext);
        }

        logsContext.run([], () => {
            try {
                const startTime = performance.now();
                interceptResponseBody(res);

                res.once('finish', () => {
                    handleRequestFinish(
                        req,
                        res,
                        client,
                        logsContext,
                        startTime,
                    );
                });

                next();
            } catch (error) {
                client.logger.error('Error in HitAPI middleware', {
                    request: req,
                    response: res,
                    error: error as Error,
                });
            }
        });
    };
}

function captureServerError(
    err: Error,
    _req: Request,
    res: Response,
    next: NextFunction,
): void {
    res.locals.serverError = err;
    next(err);
}

function interceptResponseBody(res: Response): void {
    const originalSend = res.send;
    res.send = (body: unknown) => {
        if (isSupportedContentType(res.get('content-type'))) {
            res.locals.body = body;
        }
        return originalSend.call(res, body);
    };
}

function handleRequestFinish(
    req: Request,
    res: Response,
    client: HitAPIClient,
    logsContext: AsyncLocalStorage<LogRecord[]>,
    startTime: number,
): void {
    try {
        const responseTime = performance.now() - startTime;
        const path = getRoutePath(req);
        const consumer = getConsumer(req);

        client.consumerRegistry.addOrUpdateConsumer(consumer);

        const requestSize = parseContentLength(req.get('content-length'));
        const responseSize = parseContentLength(res.get('content-length'));

        if (path) {
            recordRequest(client, req, res, {
                consumer,
                path,
                responseTime,
                requestSize,
                responseSize,
            });
        }

        if (client.requestLogger.enabled) {
            logRequest(client, req, res, logsContext, {
                consumer,
                path,
                responseTime,
                requestSize,
                responseSize,
            });
        }
    } catch (error) {
        client.logger.error(
            'Error while logging request in HitAPI middleware',
            {
                request: req,
                response: res,
                error: error as Error,
            },
        );
    }
}

interface RequestContext {
    consumer: ConsumerInfo | null;
    path: string | null;
    responseTime: number;
    requestSize?: number;
    responseSize?: number;
}

function recordRequest(
    client: HitAPIClient,
    req: Request,
    res: Response,
    ctx: RequestContext,
): void {
    const { consumer, path, responseTime, requestSize, responseSize } = ctx;
    if (!path) return;

    const method = req.method.toUpperCase() as RestfulMethod;

    client.requestCounter.addRequest({
        consumer: consumer?.identifier,
        method,
        path,
        statusCode: res.statusCode,
        responseTime,
        requestSize,
        responseSize,
    });

    if (isValidationErrorStatus(res.statusCode) && res.locals.body) {
        recordValidationErrors(client, req, res, { consumer, path });
    }

    if (res.statusCode === 500 && res.locals.serverError) {
        const serverError = res.locals.serverError as Error;
        client.serverErrorCounter.addServerError({
            consumer: consumer?.identifier,
            method,
            path,
            type: serverError.name,
            msg: serverError.message,
            traceback: serverError?.stack ?? '',
        });
    }
}

function isValidationErrorStatus(statusCode: number): boolean {
    return statusCode === 400 || statusCode === 422;
}

function recordValidationErrors(
    client: HitAPIClient,
    req: Request,
    res: Response,
    ctx: Pick<RequestContext, 'consumer' | 'path'>,
): void {
    const { consumer, path } = ctx;
    if (!path) return;

    let body: JSONValue = null;
    try {
        body = JSON.parse(res.locals.body as string) as unknown as JSONValue;
    } catch {
        return;
    }

    const validationErrors = extractExpressValidatorErrors(body);
    for (const error of validationErrors) {
        client.validationErrorCounter.addValidationError({
            consumer: consumer?.identifier,
            method: req.method.toUpperCase() as RestfulMethod,
            path,
            ...error,
        });
    }
}

function logRequest(
    client: HitAPIClient,
    req: Request,
    res: Response,
    logsContext: AsyncLocalStorage<LogRecord[]>,
    ctx: RequestContext,
): void {
    const { consumer, path, responseTime, requestSize, responseSize } = ctx;
    const logs = logsContext.getStore();

    client.requestLogger.logRequest(
        {
            timestamp: Date.now(),
            method: req.method,
            path: path ?? undefined,
            url: `${req.protocol}://${req.host}${req.originalUrl}`,
            headers: convertHeaders(req.headers),
            size: Number(requestSize),
            body: convertBody(req.body, req.get('content-type')) ?? undefined,
            clientIp: getClientIp(req) ?? undefined,
            consumer: consumer?.identifier,
        },
        {
            statusCode: res.statusCode,
            responseTime,
            headers: convertHeaders(res.getHeaders()),
            size: Number(responseSize),
            body:
                convertBody(res.locals.body, res.get('content-type')) ??
                undefined,
        },
        res.locals.serverError as Error,
        logs,
        randomUUID(),
    );
}

function getRoutePath(req: Request): string | null {
    if (!req.route) return null;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const reqRoutePath = req.route?.path as string;
    if (!req.baseUrl) return reqRoutePath;

    const routerInfo = getRouterInfo(req.app);
    if (!routerInfo.stack) return reqRoutePath;

    const routerPath = getRouterPath(routerInfo.stack, req.baseUrl);
    return reqRoutePath === '/' ? routerPath : routerPath + reqRoutePath;
}

function getRouterPath(
    stack: ILayer[] | null | undefined,
    baseUrl: string,
): string {
    const routerPaths: string[] = [];

    while (stack?.length) {
        const routerLayer = stack.find(
            (layer) =>
                layer.name === 'router' &&
                layer.path &&
                (baseUrl.startsWith(layer.path) || layer.regexp?.test(baseUrl)),
        );

        if (!routerLayer) break;

        routerPaths.push(resolveLayerPath(routerLayer));
        stack = (routerLayer.handle as { stack?: ILayer[] })?.stack;
        baseUrl = baseUrl.slice((routerLayer.path as string).length);
    }

    return routerPaths.filter((p) => p !== '/').join('');
}

function resolveLayerPath(layer: ILayer): string {
    if (layer.regexp && layer.keys?.length) {
        return '/' + parseExpressPathRegExp(layer.regexp, layer.keys);
    }
    if (layer.params && Object.keys(layer.params).length > 0) {
        return parseExpressPath(layer.path as string, layer.params);
    }
    return layer.path as string;
}

function getConsumer(req: Request): ConsumerInfo | null {
    return req.consumer ? consumerFromStringOrObject(req.consumer) : null;
}

function extractExpressValidatorErrors(
    responseBody: unknown,
): ValidationError[] {
    try {
        if (
            !responseBody ||
            typeof responseBody !== 'object' ||
            !('errors' in responseBody) ||
            !Array.isArray((responseBody as Record<string, unknown>).errors)
        ) {
            return [];
        }

        const errors: ValidationError[] = [];
        for (const error of (responseBody as { errors: unknown[] }).errors) {
            if (!isExpressValidatorError(error)) continue;
            errors.push({
                loc: `${error.location}.${error.path}`,
                msg: error.msg,
                type: error.type,
            });
        }
        return errors;
    } catch {
        return [];
    }
}

interface ExpressValidatorError {
    location: string;
    path: string;
    msg: string;
    type: string;
}

function isExpressValidatorError(
    value: unknown,
): value is ExpressValidatorError {
    return (
        !!value &&
        typeof value === 'object' &&
        typeof (value as Record<string, unknown>).location === 'string' &&
        typeof (value as Record<string, unknown>).path === 'string' &&
        typeof (value as Record<string, unknown>).msg === 'string' &&
        typeof (value as Record<string, unknown>).type === 'string'
    );
}
