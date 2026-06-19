export type PortalLoginResponse = {
    accessToken?: string;
    refreshToken?: string;
    db?: string;
};

export type PortalImportSession = {
    accessToken: string;
    db: string;
};
