import type { Application, Router } from 'express';
import type { ILayer, IRoute } from 'express-serve-static-core';
import type { PathInfo } from '@hitapi/types';
import { RestfulMethod } from '@hitapi/shared/enums';

type AppOrRouter = Application | Router;
type RouterVersion = 'v4' | 'v5';

interface Endpoint {
    path: string;
    methods: RestfulMethod[];
    middlewares: string[];
}

interface RouterInfo {
    stack: ILayer[] | null;
    version: RouterVersion;
}

const STANDARD_HTTP_METHODS = new Set<string>(Object.values(RestfulMethod));
const STACK_ITEM_VALID_NAMES = new Set<string>([
    'router',
    'bound dispatch',
    'mounted_app',
]);
const regExpToParseExpressPathRegExp =
    /^\/\^\\?\/?(?:(:?[\w\\.-]*(?:\\\/:?[\w\\.-]*)*)|(\(\?:\\?\/?\([^)]+\)\)))\\\/.*/;
const regExpToReplaceExpressPathRegExpParams = /\(\?:\\?\/?\([^)]+\)\)/;
const regexpExpressParamRegexp = /\(\?:\\?\\?\/?\([^)]+\)\)/g;
const regexpExpressPathParamRegexp = /(:[^)]+)\([^)]+\)/g;
const EXPRESS_ROOT_PATH_REGEXP_VALUE = String.raw`/^\/?(?=\/|$)/i`;

/**
 * Type guard to check if a value is a Router or Express instance
 */
const isRouterOrApp = (value: unknown): value is AppOrRouter => {
    if (!value || typeof value !== 'object') return false;
    return 'stack' in value || '_router' in value || 'router' in value;
};

/**
 * Detects Express version and returns router information
 */
export const getRouterInfo = (app: AppOrRouter): RouterInfo => {
    // Express 4: direct stack property
    if (app.stack && Array.isArray(app.stack)) {
        return { stack: app.stack, version: 'v4' };
    }

    // Express 4: internal _router property
    const app4 = app as { _router?: { stack: ILayer[] } };
    if (app4._router?.stack && Array.isArray(app4._router.stack)) {
        return { stack: app4._router.stack, version: 'v4' };
    }

    // Express 5: router property
    const app5 = app as { router?: { stack: ILayer[] } };
    if (app5.router?.stack && Array.isArray(app5.router.stack)) {
        return { stack: app5.router.stack, version: 'v5' };
    }

    return { stack: null, version: 'v4' };
};

/**
 * Extract HTTP methods from a route object
 */
const getRouteMethods = (route: IRoute): RestfulMethod[] => {
    const routeWithMethods = route as { methods?: Record<string, boolean> };
    const methods = Object.keys(routeWithMethods.methods || {})
        .filter((method) => method !== '_all')
        .map((method) => method.toUpperCase() as RestfulMethod);
    return methods;
};

/**
 * Extract middleware names from a route's stack
 */
const getRouteMiddlewares = (route: IRoute): string[] => {
    const routeWithStack = route as { stack?: ILayer[] };
    const stack = routeWithStack.stack || [];

    return stack.map((item) => {
        const handle = item.handle as { name?: string } | undefined;
        return handle?.name || 'anonymous';
    });
};

/**
 * Check if a regexp string contains parameter patterns
 */
const hasParams = (expressPathRegExp: string): boolean => {
    return regexpExpressParamRegexp.test(expressPathRegExp);
};

/**
 * Extract path from Express route regexp
 */
export const parseExpressPathRegExp = (
    expressPathRegExp: RegExp,
    keys: Array<{ name: string } | string> = [],
): string => {
    let parsedRegExp = expressPathRegExp.toString();
    let expressPathRegExpExec =
        regExpToParseExpressPathRegExp.exec(parsedRegExp);
    let paramIndex = 0;

    while (hasParams(parsedRegExp) && paramIndex < keys.length) {
        const key = keys[paramIndex];
        const paramName = typeof key === 'string' ? key : key?.name;
        const paramId = `:${paramName}`;

        parsedRegExp = parsedRegExp.replace(
            regExpToReplaceExpressPathRegExpParams,
            (str) => {
                // Express >= 4.20.0 captures slash as part of parameter
                if (str.startsWith(String.raw`(?:\/`)) {
                    return String.raw`\/${paramId}`;
                }
                return paramId;
            },
        );

        paramIndex++;
    }

    if (parsedRegExp !== expressPathRegExp.toString()) {
        expressPathRegExpExec =
            regExpToParseExpressPathRegExp.exec(parsedRegExp);
    }

    return expressPathRegExpExec?.[1]?.replaceAll(String.raw`\/`, '/') ?? '';
};

/**
 * Replace param placeholders in path with param names
 */
export const parseExpressPath = (
    expressPath: string,
    params: Record<string, string>,
): string => {
    let result = expressPath;
    for (const [paramName, paramValue] of Object.entries(params)) {
        result = result.replace(paramValue, `:${paramName}`);
    }
    return result;
};

/**
 * Parse a single route into endpoints
 */
const parseExpressRoute = (route: IRoute, basePath: string): Endpoint[] => {
    const routeWithPath = route as { path?: string };
    const paths = [routeWithPath.path || '/'];

    return paths.map((path) => {
        const completePath =
            basePath && path === '/' ? basePath : `${basePath}${path}`;

        return {
            path: completePath.replaceAll(regexpExpressPathParamRegexp, '$1'),
            methods: getRouteMethods(route),
            middlewares: getRouteMiddlewares(route),
        };
    });
};

/**
 * Merge new endpoints with existing ones, combining methods for duplicate paths
 */
const addEndpoints = (
    currentEndpoints: Endpoint[],
    endpointsToAdd: Endpoint[],
): Endpoint[] => {
    endpointsToAdd.forEach((newEndpoint) => {
        const existingEndpoint = currentEndpoints.find(
            (ep) => ep.path === newEndpoint.path,
        );

        if (existingEndpoint) {
            const newMethods = newEndpoint.methods.filter(
                (method) => !existingEndpoint.methods.includes(method),
            );
            existingEndpoint.methods.push(...newMethods);
        } else {
            currentEndpoints.push(newEndpoint);
        }
    });

    return currentEndpoints;
};

/**
 * Parse a layer stack to extract endpoints
 */
const parseStack = (
    stack: ILayer[],
    basePath: string,
    endpoints: Endpoint[],
    version: RouterVersion,
): Endpoint[] => {
    stack.forEach((stackItem) => {
        // Handle direct routes
        if (stackItem.route) {
            const newEndpoints = parseExpressRoute(stackItem.route, basePath);
            addEndpoints(endpoints, newEndpoints);
            return;
        }

        // Only process valid router/app stack items
        if (!STACK_ITEM_VALID_NAMES.has(stackItem.name)) {
            return;
        }

        let newBasePath = basePath;

        // Extract path based on Express version
        if (version === 'v4') {
            newBasePath = extractPathV4(stackItem, basePath);
        } else if (version === 'v5') {
            newBasePath = extractPathV5(stackItem, basePath);
        }

        // Recursively parse nested routers
        if (isRouterOrApp(stackItem.handle)) {
            parseEndpoints(stackItem.handle, newBasePath, endpoints);
        }
    });

    return endpoints;
};

/**
 * Extract base path for Express v4 (uses regexp)
 */
const extractPathV4 = (stackItem: ILayer, basePath: string): string => {
    let newBasePath = basePath;

    if (!stackItem.regexp) return newBasePath;

    const regexpStr = stackItem.regexp.toString();
    const isExpressPathRegExp = regExpToParseExpressPathRegExp.test(regexpStr);

    if (isExpressPathRegExp) {
        const parsedPath = parseExpressPathRegExp(
            stackItem.regexp,
            stackItem.keys,
        );
        if (parsedPath && parsedPath !== '/') {
            newBasePath += parsedPath.startsWith('/')
                ? parsedPath
                : `/${parsedPath}`;
        }
    } else if (
        !stackItem.path &&
        stackItem.regexp &&
        regexpStr !== EXPRESS_ROOT_PATH_REGEXP_VALUE
    ) {
        const regExpPath = `RegExp(${stackItem.regexp})`;
        newBasePath += `/${regExpPath}`;
    }

    return newBasePath;
};

/**
 * Extract base path for Express v5 (uses explicit path)
 */
const extractPathV5 = (stackItem: ILayer, basePath: string): string => {
    let newBasePath = basePath;

    if (!stackItem.path) return newBasePath;

    if (stackItem.path !== '/') {
        newBasePath += stackItem.path.startsWith('/')
            ? stackItem.path
            : `/${stackItem.path}`;
    }

    return newBasePath;
};

/**
 * Parse all endpoints from an app or router
 */
const parseEndpoints = (
    app: AppOrRouter,
    basePath: string = '',
    endpoints: Endpoint[] = [],
): Endpoint[] => {
    const routerInfo = getRouterInfo(app);

    if (!routerInfo.stack) {
        // Add base path endpoint if endpoints exist but no stack
        if (endpoints.length) {
            addEndpoints(endpoints, [
                {
                    path: basePath,
                    methods: [],
                    middlewares: [],
                },
            ]);
        }
        return endpoints;
    }

    return parseStack(
        routerInfo.stack,
        basePath,
        endpoints,
        routerInfo.version,
    );
};

/**
 * Get all endpoints from an Express app or Router with methods
 */
export const getEndpoints = (
    app: AppOrRouter,
    basePath: string = '',
): PathInfo[] => {
    const endpoints = parseEndpoints(app, basePath);

    return endpoints.flatMap((route) =>
        route.methods
            .filter((method) => STANDARD_HTTP_METHODS.has(method))
            .map((method) => ({
                method,
                path: (basePath + route.path).replaceAll('//', '/'),
            })),
    );
};
