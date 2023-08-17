export class CreateEventEntity {
    id?: string;
    name: string;
    description: string;
    city: string;
    country: string;
    startDate: number;
    endDate: number;
    multiDay: boolean;
    virtual: boolean;
    poapsQuantity: number;
    externalUserId: string;
}
