import { CollectibleRaffleDto } from 'src/core/dto';
import { collectibleDtoMock, raffleDtoMock } from 'src/core/testsMocks';

export const collectibleRaffleDtoMock: CollectibleRaffleDto = {
    id: 'collectibleRaffleId',
    collectibleId: collectibleDtoMock,
    raffleId: raffleDtoMock,
    score: 10,
    createdBy: '1',
    createdAt: Date.now()
};
