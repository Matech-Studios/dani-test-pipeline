import { CreateUserRequest as CreateUserRequestMock } from 'src/core/contracts';

export const signUpDataMock: CreateUserRequestMock[] = [
    {
        name: 'John',
        lastName: 'Cena',
        email: 'john@test.com',
        companyName: 'Matech Studios',
        password: '12345678'
    }
];
