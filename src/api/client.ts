import { apiConfig } from "./config";
import type { ServerResponse } from "./models/serverResponse";
import { toCamel, toSnake } from "./util/transform";

export class ApiError extends Error {
    public readonly status: number;
    public readonly payload?: unknown;

    constructor(message: string, status: number, payload?: unknown) {
        super(message);
        this.status = status;
        this.payload = payload;
    }
}

const apiGroups = ["public", "portal"] as const;
type ApiGroup = (typeof apiGroups)[number];

const normalizePathQuery = (path: string) => {
    const [pathname, search = ""] = path.split("?");
    if (!search) return pathname;

    const params = new URLSearchParams(search);
    const snakedParams = new URLSearchParams();
    params.forEach((value, key) => {
        const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
        snakedParams.append(snakeKey, value);
    });

    return `${pathname}?${snakedParams.toString()}`;
};

const buildUrl = (path: string, group: ApiGroup = "public") => {
    const trimmedPath = normalizePathQuery(path.replace(/^\/+/, ""));
    const hasApiGroup = apiGroups.some((apiGroup) => trimmedPath.startsWith(`${apiGroup}/`));
    const groupedPath = hasApiGroup
        ? trimmedPath
        : `${group}/${trimmedPath}`;

    return `${apiConfig.baseUrl}/${groupedPath}`;
};

type ApiResponseType = 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData';

type ApiRequestInit = Omit<RequestInit, "body"> &
{
    apiGroup?: ApiGroup;
    body?: unknown;
    responseType?: ApiResponseType;
    timeoutMs?: number;
};

type ScopedApiRequestInit = Omit<ApiRequestInit, "apiGroup">;

export async function apiRequest<T = unknown>(
    path: string,
    init: ApiRequestInit = {}
): Promise<ServerResponse<T>> {
    const { apiGroup, body, responseType = 'json', timeoutMs, ...rest } = init;
    const url = buildUrl(path, apiGroup);
    const headers = new Headers(init.headers ?? {});

    if (apiConfig.apiKey) {
        headers.set('x-api-key', apiConfig.apiKey);
    }

    const controller = new AbortController();
    const timeoutHandle = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : null;

    const requestInit: RequestInit = {
        ...rest,
        headers,
        signal: rest.signal ?? controller.signal,
    };

    if (body !== undefined) {
        if (body instanceof FormData) {
            const snaked = new FormData();
            body.forEach((value, key) => {
                snaked.append(key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`), value);
            });
            requestInit.body = snaked;
        } else if (typeof body === 'object') {
            if (!headers.has('Content-Type')) {
                headers.set('Content-Type', 'application/json');
            }
            requestInit.body = JSON.stringify(toSnake(body));
        } else {
            requestInit.body = String(body);
        }
    }

    let response: Response;
    try {
        response = await fetch(url, requestInit);
    } finally {
        if (timeoutHandle !== null) clearTimeout(timeoutHandle);
    }

    if (responseType === 'blob') {
        if (!response.ok) {
            throw new ApiError(response.statusText, response.status);
        }

        return {
            statusCode: response.status,
            success: true,
            message: undefined,
            data: (await response.blob()) as T,
        };
    }

    if (responseType === 'arrayBuffer') {
        if (!response.ok) {
            throw new ApiError(response.statusText, response.status);
        }

        return {
            statusCode: response.status,
            success: true,
            message: undefined,
            data: (await response.arrayBuffer()) as T,
        };
    }

    const text = await response.text();

    let parsed: unknown = null;
    if (text) {
        try {
            parsed = JSON.parse(text);
        } catch {
            parsed = text;
        }
    }

    const payload =
        typeof parsed === 'object' && parsed !== null
            ? (parsed as Record<string, unknown>)
            : null;

    const serverResponse: ServerResponse<T> = {
        statusCode: response.status,
        success: (payload?.['success'] as boolean) ?? response.ok,
        message:
            (payload?.['message'] as string | undefined) ??
            (response.ok ? undefined : response.statusText),
        data: toCamel(payload?.['data'] ?? parsed ?? null) as T,
        meta: payload && 'meta' in payload ? toCamel(payload['meta']) : undefined,
    };

    if (!response.ok) {
        throw new ApiError(
            serverResponse.message ?? response.statusText,
            response.status,
            serverResponse
        );
    }

    return serverResponse;
}

let portalSession: { accessToken: string; db: string } | null = null;

export const setPortalSession = (session: { accessToken: string; db: string } | null) => {
    portalSession = session;
};

export function portalApiRequest<T = unknown>(
    path: string,
    init: ScopedApiRequestInit = {}
): Promise<ServerResponse<T>> {
    if (!portalSession) {
        return apiRequest<T>(path, { ...init, apiGroup: "portal" });
    }

    const { accessToken, db } = portalSession;
    const headers = new Headers((init.headers as HeadersInit) ?? {});
    headers.set("Authorization", `Bearer ${accessToken}`);

    const method = (init.method ?? "GET").toUpperCase();
    const isReadMethod = method === "GET" || method === "HEAD" || method === "DELETE";

    if (isReadMethod) {
        const [pathname, search = ""] = path.split("?");
        const params = new URLSearchParams(search);
        params.set("_db", db);
        return apiRequest<T>(`${pathname}?${params.toString()}`, { ...init, apiGroup: "portal", headers });
    }

    return apiRequest<T>(path, {
        ...init,
        apiGroup: "portal",
        headers,
        body: { ...(typeof init.body === "object" && init.body !== null ? (init.body as Record<string, unknown>) : {}), _db: db },
    });
}
