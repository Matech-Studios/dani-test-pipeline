import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { eventDtoMock } from '../event/eventDto.mock';

export const collectibleDtoListMock: CollectibleDto[] = [
    {
        id: '1',
        name: 'My first collectible',
        description: 'Collectible description',
        attendees: 50,
        image: null,
        event: eventDtoMock,
        website: 'mementolabs.xyz',
        createdAt: 12345,
        createdBy: 'user-id',
        fullImagePath: 'http://base.urlmykey.png'
    },
    {
        id: '2',
        name: 'My second collectible',
        description: 'Collectible 2 description',
        attendees: 50,
        image: null,
        event: eventDtoMock,
        website: 'mementolabs.xyz',
        createdAt: 12345,
        createdBy: 'user-id',
        fullImagePath: 'http://base.urlmykey.png'
    },
    {
        id: '3',
        name: 'My third collectible',
        description: 'Collectible 3 description',
        attendees: 50,
        image: null,
        event: eventDtoMock,
        website: 'mementolabs.xyz',
        createdAt: 12345,
        createdBy: 'user-id',
        fullImagePath: 'http://base.urlmykey.png'
    }
];
