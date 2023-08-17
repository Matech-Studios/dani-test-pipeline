import { CollectibleRaffleDto } from 'src/core/dto';
import { collectibleDtoListMock, raffleDtoMock } from 'src/core/testsMocks';

export const collectibleRaffleListMock: CollectibleRaffleDto[] = [
    {
        id: '1',
        collectibleId: collectibleDtoListMock[0],
        raffleId: raffleDtoMock,
        score: 1,
        createdBy: '1',
        createdAt: Date.now()
    },
    {
        id: '2',
        collectibleId: collectibleDtoListMock[1],
        raffleId: raffleDtoMock,
        score: 2,
        createdBy: '1',
        createdAt: Date.now()
    },
    {
        id: '3',
        collectibleId: collectibleDtoListMock[2],
        raffleId: raffleDtoMock,
        score: 5,
        createdBy: '1',
        createdAt: Date.now()
    }
];
