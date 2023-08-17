import { EventDto } from 'src/core/dto/event.dto';

export const eventDtoListMock: EventDto[] = [
    {
        id: '1',
        name: 'Event 1',
        description: 'Event 1 description',
        city: 'Madrid',
        country: 'Spain',
        startDate: 1672961117343,
        endDate: 1672961117343,
        multiDay: true,
        virtual: false,
        companyId: '1',
        createdBy: '1',
        poapsQuantity: 5,
        createdAt: 1672961110000,
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
        multiDay: true,
        virtual: false,
        companyId: '1',
        createdBy: '1',
        poapsQuantity: 5,
        createdAt: 1672961110001,
        attendees: 45
    }
];
