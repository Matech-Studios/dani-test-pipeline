import { EventDto } from 'src/core/dto/event.dto';

export const eventDtoMock: EventDto = {
    id: '1',
    name: 'Event 1',
    description: 'Event description',
    city: 'Madrid',
    country: 'Spain',
    startDate: 1672961117343,
    endDate: 1672961117343,
    multiDay: true,
    virtual: false,
    companyId: '1',
    createdBy: '1',
    poapsQuantity: 5,
    createdAt: Date.now(),
    attendees: 45
};

export const publicEventResponseMock = {
    description: eventDtoMock.description,
    location: `${eventDtoMock.city} - ${eventDtoMock.country}`,
    name: eventDtoMock.name,
    startDate: eventDtoMock.startDate,
    endDate: eventDtoMock.endDate
};
