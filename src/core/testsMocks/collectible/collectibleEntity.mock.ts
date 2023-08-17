import { CollectibleEntity } from 'src/core/entities/collectible.entity';

export const collectibleEntityMock: CollectibleEntity = {
    id: 'abcd',
    name: 'Collectible name',
    attendees: 50,
    eventId: 'uid4-event',
    image: {
        fieldname: 'image.png',
        mimetype: 'image/png',
        buffer: Buffer.from('image.png')
    },
    description: 'collectible description',
    website: 'mementolabs.xyz',
    createdBy: 'userName'
};
