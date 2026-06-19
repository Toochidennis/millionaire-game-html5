export interface ActivationResponse {
    status: 'payment_required' | 'activated' | 'limit_reached' | 'expired' | 'already_active' | 'started_trial' | 'not_available';
    message: string;
    license?: {
        licenseId: number;
        type: 'trial' | 'payment';
        platform: 'desktop' | 'mobile';
        expiresAt: string;
        issuedAt: string;
        status: 'active' | 'inactive' | 'expired' | 'invalid';
        deviceBound: boolean;
    },
    policy?: {
        revalidateAfterDays: number;
        offlineAllowed: boolean;
    }
}