import { CollectibleResponse } from './collectible.response';

export class EventResponse {
    id: string;
    name: string;
    description: string;
    city?: string;
    country?: string;
    startDate: number;
    endDate?: number;
    virtual?: boolean;
    multiDay?: boolean;
    poapsQuantity?: number;
    collectibles?: CollectibleResponse[];
    raffles?: any[];
    createdBy: string;
    updatedBy?: string;
    createdAt: number;
    updatedAt?: number;
    attendees: number;

    constructor(data: Partial<EventResponse>) {
        Object.assign(this, data);
        this.startDate = Number(data.startDate);
        this.endDate = data.endDate ? Number(data.endDate) : undefined;
        this.createdAt = data.createdAt ? Number(data.createdAt) : undefined;
        this.updatedAt = data.updatedAt ? Number(data.updatedAt) : undefined;
        this.attendees = Number(data.attendees);
    }
}
