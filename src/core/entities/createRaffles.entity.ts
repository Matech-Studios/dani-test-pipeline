export class CreateRafflesEntity {
    eventId: string;
    externalUserId: string;
    raffles: UpsertRaffleEntity[];
}

export class UpsertRaffleEntity {
    id?: string;
    name: string;
    useWeight: boolean;
    key: number;
    prizes: CreateRafflePrizeEntity[];
}

export class CreateRafflePrizeEntity {
    order: number;
    details: string;
    quantity: number | string;
}

export class ExecuteRaffleEntity {
    raffleId: string;
    externalUserId: string;
}
