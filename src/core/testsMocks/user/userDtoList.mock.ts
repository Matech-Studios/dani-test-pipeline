import { UserDto } from 'src/core/dto/user.dto';

export const userDtoListMock: UserDto[] = [
    {
        id: '1',
        externalUserId: '1313',
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
    },
    {
        id: '2',
        externalUserId: '1414',
        name: 'Rufus',
        lastName: 'Sanchez',
        email: 'rufus@test.com',
        company: {
            id: '2',
            name: 'Other company',
            createdAt: Date.now(),
            createdBy: 'user-id'
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
        userResendCodeAttempts: null
    }
];
