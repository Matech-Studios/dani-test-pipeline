import { RaffleDto } from 'src/core/dto/raffle.dto';
import { eventDtoMock } from '../event/eventDto.mock';
import { createRafflesEntityMock } from './raffleEntity.mock';

export const raffleDtoMock: RaffleDto = {
    ...createRafflesEntityMock.raffles[0],
    id: '1',
    event: eventDtoMock,
    createdBy: '1',
    createdAt: Date.now(),
    prizes: null
};
