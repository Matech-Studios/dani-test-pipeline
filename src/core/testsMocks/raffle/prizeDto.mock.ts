import { PrizeDto } from 'src/core/dto/prize.dto';
import { userDtoMock } from '../user/userDto.mock';
import { createRafflesEntityMock } from './raffleEntity.mock';

export const prizeDtoMock: PrizeDto = {
    id: 'prize-1',
    order: 1,
    details: '1st prize',
    quantity: 1,
    createdAt: Date.now(),
    createdBy: userDtoMock.id,
    raffle: {
        ...createRafflesEntityMock.raffles[0],
        id: '1',
        createdAt: Date.now(),
        createdBy: userDtoMock.id,
        prizes: null,
        status: ''
    }
};
