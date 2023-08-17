import { CompanyDto } from 'src/core/dto/company.dto';

export const companiesMock: CompanyDto[] = [
    {
        id: '1',
        name: 'Matech Studios',
        createdAt: Date.now(),
        createdBy: 'user-id'
    },
    {
        id: '2',
        name: 'Test Company',
        createdAt: Date.now(),
        createdBy: 'user-id'
    }
];
