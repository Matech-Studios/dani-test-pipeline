import { EventsResponse } from 'src/core/contracts/responses/eventsList.response';

export const eventsResponseListMock: EventsResponse[] = [
    {
        id: '1',
        name: 'Event 1',
        city: 'Madrid',
        country: 'Spain',
        startDate: 1672961117343,
        endDate: 1672961117343,
        poapsQuantity: 5,
        virtual: false,
        location: 'Madrid - Spain'
    },
    {
        id: '2',
        name: 'Event 2',
        city: 'Madrid',
        country: 'Spain',
        startDate: 1672961117343,
        endDate: 1672961117343,
        poapsQuantity: 5,
        virtual: false,
        location: 'Madrid - Spain'
    }
];
