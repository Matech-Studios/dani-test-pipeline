import { EventResponse } from '../../contracts/responses/event.response';

export const editEventResponseMock: EventResponse = {
    id: '1',
    name: 'Event edited',
    description: 'Event edition',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1672961117343,
    endDate: 1672961117343,
    virtual: false,
    multiDay: true,
    poapsQuantity: 5,
    createdBy: '1',
    updatedBy: '1',
    createdAt: 1674069521000,
    attendees: 45
};
