import { EditEventEntity } from 'src/core/entities';

export const editEventEntityMock: EditEventEntity = {
    id: '1',
    name: 'Event edited',
    description: 'Event edition',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1675961117343,
    endDate: 1677961117343,
    multiDay: true,
    virtual: false,
    poapsQuantity: 5,
    externalUserId: '1',
    attendees: 45
};
