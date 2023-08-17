export class EventEntity {
    id: string;
    name: string;
    description: string;
    city?: string;
    country?: string;
    startDate: number;
    endDate?: number;
    multiDay?: boolean;
    virtual?: boolean;
    location?: string | null;
    poapsQuantity?: number;
    collectibles?: any;
    createdBy: string;
    updatedBy?: string;
    createdAt: number;
    updatedAt?: number;
    attendees: number;
}
