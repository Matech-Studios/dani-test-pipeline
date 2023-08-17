export class EventsResponse {
    id: string;
    name: string;
    city: string;
    country: string;
    startDate: number;
    endDate: number;
    poapsQuantity: number;
    virtual: boolean;
    location: string | null;

    constructor(data: Partial<EventsResponse>) {
        Object.assign(this, data);
        this.startDate = Number(data.startDate);
        this.endDate = Number(data.endDate);
    }
}
