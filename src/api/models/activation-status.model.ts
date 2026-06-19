export interface ActivationStatus {
    active: boolean;
    licenseId?: number;
    expiresAt?: string;
    deviceBound?: boolean;
    reason?: 'no_license_for_device' | 'expired' | 'device_not_registered'
    source?: 'trial' | 'payment' | 'other';
}