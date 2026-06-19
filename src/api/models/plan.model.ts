export interface Plan {
    id: number;
    name: string;
    durationDays: number;
    freeTrialDays: number;
    price: number;
    finalPrice: number;
    features: string[];
    discountPercent: number;
    currency: string;
}