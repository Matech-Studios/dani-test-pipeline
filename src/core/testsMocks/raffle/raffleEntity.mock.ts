import { CreateRafflesEntity } from 'src/core/entities';

export const createRafflesEntityMock: CreateRafflesEntity = {
    eventId: 'event-1',
    externalUserId: 'ext-user-1',
    raffles: [
        {
            name: 'raffle-name-1',
            key: 1,
            useWeight: true,
            prizes: [
                {
                    order: 1,
                    details: '1st prize',
                    quantity: 1
                }
            ]
        }
    ]
};
