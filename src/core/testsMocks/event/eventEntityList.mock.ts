import { EventEntity } from 'src/core/entities';

export const eventEntityListMock: EventEntity[] = [
    {
        id: '1',
        name: 'Event 1',
        description: 'Event 1 description',
        city: 'Madrid',
        country: 'Spain',
        startDate: 1672961117343,
        endDate: 1672961117343,
        poapsQuantity: 5,
        createdBy: '1',
        createdAt: Date.now(),
        virtual: false,
        location: 'Madrid - Spain',
        attendees: 45
    },
    {
        id: '2',
        name: 'Event 2',
        description: 'Event 2 description',
        city: 'Madrid',
        country: 'Spain',
        startDate: 1672961117343,
        endDate: 1672961117343,
        poapsQuantity: 5,
        createdBy: '1',
        createdAt: Date.now(),
        virtual: false,
        location: 'Madrid - Spain',
        attendees: 45
    }
];
