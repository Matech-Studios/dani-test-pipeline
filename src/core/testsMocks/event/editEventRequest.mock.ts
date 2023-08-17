import { EditEventRequest } from '../../contracts/requests/editEvent.request';

export const editEventRequestMock: EditEventRequest = {
    name: 'Event edited',
    description: 'Event edition',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1675961117343,
    endDate: 1677961117343,
    multiDay: true,
    virtual: false,
    poapsQuantity: 5,
    attendees: 45
};
