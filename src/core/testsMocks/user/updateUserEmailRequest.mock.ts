import { UserUpdateEmailRequest as UpdateUserEmailRequestMock } from 'src/core/contracts';
import { UserUpdateEmailEntity } from 'src/core/entities';

export const updateUserEmailRequestMock: UpdateUserEmailRequestMock = {
    newEmail: 'newmock@example.com'
};

export const updateUserEmailEntityMock: UserUpdateEmailEntity = {
    email: 'fakeExternalUserId',
    newEmail: 'newmock@example.com'
};
