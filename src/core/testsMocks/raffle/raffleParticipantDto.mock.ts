import { RafflesParticipantsDto } from 'src/core/dto';

export const raffleParticipantDtoMock: RafflesParticipantsDto = {
    id: 'participantId',
    ticketNumber: 12345,
    beneficiary: 'beneficiary',
    event: {
        id: '1',
        name: '',
        description: '',
        startDate: 0,
        multiDay: false,
        virtual: false,
        createdBy: '',
        createdAt: 0,
        attendees: 45
    },
    createdAt: Date.now()
};
