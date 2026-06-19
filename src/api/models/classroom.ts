export type AccessCodeVerification = {
    valid: boolean;
    message?: string;
};

export type Institution = {
    id: string;
    slug: string;
    name: string;
    type: string;
    email: string;
    userId: string;
    joinCode: string;
    passwordHash?: string | null;
    phone?: string | null;
    website?: string | null;
    address?: string | null;
    logoUrl?: string | null;
    bannerUrl?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateInstitutionPayload = {
    id: string;
    name: string;
    type: string;
    email: string;
    accessCode: string;
    userId: number;
    phone?: string;
    website?: string;
    address?: string;
    logo?: File | null;
    banner?: File | null;
};

export type InstitutionAuthResponse = {
    institution: Institution;
};
