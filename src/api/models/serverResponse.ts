export type ServerResponse<T = unknown> = {
    statusCode: number;
    success: boolean;
    message?: string;
    data: T;
    meta?: unknown;
};
