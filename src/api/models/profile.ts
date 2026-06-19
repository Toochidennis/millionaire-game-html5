export interface Profile {
    id: number;
    userId: number;
    firstName: string;
    lastName: string;
    birthDate?: string;
    gender?: string;
    isActive?: boolean;
}