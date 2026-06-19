export interface PaymentStatus {
    status: 'success' | 'failed'
    message: string;
    salt?: string;
}

export interface OnlinePaymentInitResponse {
    status: 'failed' | 'pending';
    message: string;
    paymentUrl?: string;
    reference?: string;
}

export interface BillingStatusResponse {
    status: 'success' | 'failed';
    message: string;
}