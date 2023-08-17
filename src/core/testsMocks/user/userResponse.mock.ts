import { UserResponse } from '../../contracts/responses/user.response';
import { companyDtoMock } from '../company/companyDto.mock';

export const userResponseMock: UserResponse = {
    id: 'string',
    name: 'string',
    lastName: 'string',
    email: 'string',
    company: companyDtoMock
};
