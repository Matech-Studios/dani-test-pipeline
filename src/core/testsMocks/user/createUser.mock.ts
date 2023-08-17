import { CreateUserEntity } from 'src/core/entities/createUser.entity';

export const createUserEntityMock: CreateUserEntity = {
    name: 'John',
    lastName: 'Cena',
    company: {
        name: 'Matech Studios'
    },
    email: 'john@test.com',
    password: '12345678'
};
