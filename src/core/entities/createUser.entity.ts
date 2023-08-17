import { CreateCompanyEntity } from 'src/core/entities';

export class CreateUserEntity {
    id?: string;
    externalUserId?: string;
    name: string;
    lastName: string;
    company: CreateCompanyEntity;
    email: string;
    password: string;
}
