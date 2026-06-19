export interface ApiConfig {
    baseUrl: string;
    apiKey?: string;
    imageBaseUrl?: string;
}

const cleanUrl = (value: string) => value.replace(/\/+$/, "");

export const apiConfig: ApiConfig = {
    baseUrl: cleanUrl(import.meta.env.VITE_API_BASE_URL ?? "http://localhost/api3/v3"),
    apiKey: import.meta.env.VITE_API_KEY,
    imageBaseUrl: cleanUrl(import.meta.env.VITE_ASSET_BASE_URL ?? "https://localhost"),
};
