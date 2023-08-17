import { CreateEventEntity } from 'src/core/entities';

export const createEventEntityMock: CreateEventEntity = {
    id: '1',
    name: 'Event 1',
    description: 'Event description',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1675961117343,
    endDate: 1677961117343,
    multiDay: true,
    virtual: false,
    poapsQuantity: 5,
    externalUserId: '1'
};
