import { CompanyEntity } from 'src/core/entities';

export class UserEntity {
    id: string;
    externalUserId: string;
    name: string;
    lastName: string;
    company?: CompanyEntity;
    email: string;
}
