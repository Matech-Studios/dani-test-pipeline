import { EventDto } from 'src/core/dto/event.dto';

const date = new Date().getTime();
const dateCreation = 1674069521000;
export const editEventDtoMock: EventDto = {
    id: '1',
    name: 'Event 1',
    description: 'Event description',
    city: 'Madrid',
    country: 'Spain',
    startDate: date,
    endDate: date,
    multiDay: true,
    virtual: true,
    companyId: '1',
    createdBy: '1',
    updatedBy: '1',
    createdAt: dateCreation,
    updatedAt: dateCreation,
    poapsQuantity: 5,
    attendees: 45
};
