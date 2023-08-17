import { CreateEventRequest } from 'src/core/contracts/requests/createEvent.request';

export const createEventRequestMock: CreateEventRequest = {
    name: 'Event 1',
    description: 'Event 1 description',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1675961117343,
    endDate: 1677961117343,
    multiDay: true,
    virtual: false,
    poapsQuantity: 5,
    attendees: 45
};
