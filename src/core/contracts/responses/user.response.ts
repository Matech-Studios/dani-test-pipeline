import { CompanyDto } from 'src/core/dto/company.dto';

export class UserResponse {
    id: string;
    name: string;
    lastName: string;
    email: string;
    company: CompanyDto;
}
