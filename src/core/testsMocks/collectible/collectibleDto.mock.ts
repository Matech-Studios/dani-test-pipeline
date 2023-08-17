import { CollectibleDto } from 'src/core/dto/collectible.dto';
import { eventDtoMock } from '../event/eventDto.mock';

export const collectibleDtoMock: CollectibleDto = {
    id: 'abcd',
    name: 'My first collectible',
    description: 'Collectible description',
    attendees: 50,
    image: null,
    event: eventDtoMock,
    website: 'mementolabs.xyz',
    createdAt: 12345,
    createdBy: 'user-id',
    fullImagePath: 'http://base.urlmykey.png'
};
