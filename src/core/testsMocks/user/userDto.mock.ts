import { UserDto } from 'src/core/dto/user.dto';

export const userDtoMock: UserDto = {
    id: '1',
    externalUserId: '1',
    name: 'John',
    lastName: 'Cena',
    email: 'john@test.com',
    company: {
        id: '1',
        name: 'Matech Studios',
        createdAt: Date.now(),
        createdBy: 'user-id'
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    userResendCodeAttempts: null
};
