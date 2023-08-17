import { UserEntity } from '../../entities/user.entity';

export const userEntityMock: UserEntity = {
    id: '1',
    externalUserId: 'fakeExternalUserId',
    name: 'John',
    lastName: 'Cena',
    company: {
        id: '1',
        name: 'Matech Studios'
    },
    email: 'john@test.com'
};
