import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthTokens, QueryParams, RFC9457Response } from '@hitapi/types';
import { ApiError, type FieldError } from './types';

export const API_BASE_URL: string =
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api/v1';

export type JsonBody = object;

export interface RequestOptions {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    query?: QueryParams;
    body?: JsonBody;
    signal?: AbortSignal;
    anonymous?: boolean; // Skip attaching the bearer token
    _retry?: boolean; // Internal flag to avoid infinite 401 loops
}

function buildUrl(path: string, query?: QueryParams): string {
    const base = API_BASE_URL.replace(/\/$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    const url = new URL(`${base}/${cleanPath}`);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined || value === null || value === '') continue;

            if (typeof value === 'string') {
                url.searchParams.set(key, value);
            } else if (
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                url.searchParams.set(key, String(value));
            }
        }
    }

    return url.toString();
}

function extractFieldErrors(body: RFC9457Response | null): FieldError[] {
    if (!body?.errors) return [];
    return body.errors.map((err) => ({
        field: err.field,
        message: err.detail,
    }));
}

function extractMessage(body: RFC9457Response | null, status: number): string {
    const statusStr = String(status);

    if (!body) return `Request failed with status ${statusStr}`;

    if (body.errors && body.errors.length > 0) {
        return body.errors
            .map((err) =>
                err.field ? `${err.field}: ${err.detail}` : err.detail,
            )
            .join(', ');
    }

    if (body.detail) return body.detail;
    if (body.title) return body.title;

    return `Request failed with status ${statusStr}`;
}

function handleUnauthorized(): void {
    useAuthStore.getState().logout();
    if (
        typeof window !== 'undefined' &&
        !window.location.pathname.startsWith('/login')
    ) {
        window.location.assign(
            `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
        );
    }
}

let activeRefreshPromise: Promise<string | null> | null = null;

function isAuthEndpoint(path: string): boolean {
    return (
        path.includes('/auth/refresh') ||
        path.includes('/auth/login') ||
        path.includes('/auth/register')
    );
}

function isAbortError(cause: unknown, signal?: AbortSignal): boolean {
    return (
        signal?.aborted === true ||
        (cause instanceof DOMException && cause.name === 'AbortError') ||
        (cause instanceof Error && cause.name === 'AbortError')
    );
}

async function fetchApiResponse(
    path: string,
    options: RequestOptions,
): Promise<Response> {
    const { method = 'GET', query, body, signal, anonymous } = options;
    const headers: Record<string, string> = { Accept: 'application/json' };

    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (!anonymous) {
        const token = useAuthStore.getState().token;
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await fetch(buildUrl(path, query), {
            method,
            headers,
            signal,
            credentials: 'include',
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch (cause: unknown) {
        if (isAbortError(cause, signal)) throw cause;

        const message =
            'Unable to reach the server. Please check your internet connection or try again later';
        toast.error(message);
        throw new ApiError(0, message, null);
    }
}

async function parseResponse(response: Response): Promise<unknown> {
    const raw = await response.text();
    if (!raw) return null;

    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function reportResponseError(
    response: Response,
    parsed: unknown,
    retry: boolean | undefined,
    authEndpoint: boolean,
): never {
    const errorBody = (parsed as RFC9457Response | null) ?? null;
    const error = new ApiError(
        response.status,
        extractMessage(errorBody, response.status),
        errorBody,
        extractFieldErrors(errorBody),
    );

    if (response.status === 401 && !retry && !authEndpoint) {
        handleUnauthorized();
    } else if (response.status >= 500) {
        toast.error('Something went wrong on the server. Please try again.');
    }
    throw error;
}

export type RefreshResult =
    | { status: 'success'; token: string }
    | { status: 'unauthorized' }
    | { status: 'network_error'; error: Error };

export async function silentRefreshTokenDetails(): Promise<RefreshResult> {
    try {
        const refreshUrl = buildUrl('/auth/refresh');
        const response = await fetch(refreshUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (
            response.status === 401 ||
            response.status === 403 ||
            response.status === 400
        ) {
            return { status: 'unauthorized' };
        }

        if (!response.ok) {
            return {
                status: 'network_error',
                error: new Error(`Server returned status ${response.status}`),
            };
        }

        const raw = await response.text();
        if (!raw) return { status: 'unauthorized' };

        const tokens = JSON.parse(raw) as AuthTokens;
        if (tokens.access_token) {
            useAuthStore.getState().setTokens(tokens);
            return { status: 'success', token: tokens.access_token };
        }
        return { status: 'unauthorized' };
    } catch (cause: unknown) {
        return {
            status: 'network_error',
            error:
                cause instanceof Error
                    ? cause
                    : new Error('Network connection failed'),
        };
    }
}

export function silentRefreshToken(): Promise<string | null> {
    if (activeRefreshPromise) {
        return activeRefreshPromise;
    }

    activeRefreshPromise = (async () => {
        try {
            const result = await silentRefreshTokenDetails();
            if (result.status === 'success') {
                return result.token;
            }
            return null;
        } finally {
            activeRefreshPromise = null;
        }
    })();

    return activeRefreshPromise;
}

export async function apiRequest<TResponse>(
    path: string,
    options: RequestOptions = {},
): Promise<TResponse> {
    const { anonymous, _retry } = options;
    const authEndpoint = isAuthEndpoint(path);
    const response = await fetchApiResponse(path, options);

    if (response.status === 401 && !anonymous && !_retry && !authEndpoint) {
        const newToken = await silentRefreshToken();
        if (newToken) {
            return apiRequest<TResponse>(path, {
                ...options,
                _retry: true,
            });
        }

        handleUnauthorized();
    }

    if (response.status === 204) return undefined as TResponse;

    const parsed = await parseResponse(response);

    if (!response.ok) {
        return reportResponseError(response, parsed, _retry, authEndpoint);
    }

    return parsed as TResponse;
}

export const api = {
    get: <T>(path: string, query?: QueryParams, signal?: AbortSignal) =>
        apiRequest<T>(path, { query, signal }),
    post: <T>(path: string, body?: JsonBody, options?: RequestOptions) =>
        apiRequest<T>(path, { ...options, method: 'POST', body }),
    patch: <T>(path: string, body?: JsonBody, options?: RequestOptions) =>
        apiRequest<T>(path, { ...options, method: 'PATCH', body }),
    put: <T>(path: string, body?: JsonBody, options?: RequestOptions) =>
        apiRequest<T>(path, { ...options, method: 'PUT', body }),
    delete: <T>(path: string, options?: RequestOptions) =>
        apiRequest<T>(path, { ...options, method: 'DELETE' }),
};
