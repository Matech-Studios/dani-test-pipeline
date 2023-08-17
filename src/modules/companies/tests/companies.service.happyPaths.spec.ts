import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { companiesMock } from 'src/core/testsMocks/company/companies.mock';
import { createCompanyMock } from 'src/core/testsMocks/company/createCompany.mock';
import { CustomLogger } from 'src/core/utils';
import { CompanyService } from 'src/modules/companies/companies.service';
import { companyDtoMock } from '../../../core/testsMocks/company/companyDto.mock';

describe('Companies Service', () => {
    let companiesService: CompanyService;
    describe('Happy Paths', () => {
        const mockEntityManager = {
            create: jest.fn().mockResolvedValue(companyDtoMock),
            findOne: jest.fn().mockResolvedValue(companyDtoMock),
            find: jest.fn().mockResolvedValue(companiesMock),
            nativeDelete: jest.fn(),
            persistAndFlush: jest.fn()
        };

        beforeEach(async () => {
            const moduleRef: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CompanyService,
                    {
                        provide: EntityManager,
                        useValue: mockEntityManager
                    }
                ]
            }).compile();

            companiesService = moduleRef.get<CompanyService>(CompanyService);
        });

        describe('Create company', () => {
            it('should create a company', async () => {
                await companiesService.create(createCompanyMock.name);
                expect(mockEntityManager.create).toHaveBeenCalled();
            });
        });

        describe('Delete company by id', () => {
            it('should delete a company', async () => {
                await companiesService.deleteCompanyById(createCompanyMock.id);
                expect(mockEntityManager.nativeDelete).toHaveBeenCalled();
            });
        });

        describe('Delete company by name', () => {
            it('should delete a company', async () => {
                await companiesService.deleteCompanyByName(createCompanyMock.name);
                expect(mockEntityManager.nativeDelete).toHaveBeenCalled();
            });
        });

        describe('Find one company by name', () => {
            it('should retrieve company if name is found', async () => {
                const company = await companiesService.getCompanyByName('Matech Studios');

                expect(mockEntityManager.findOne).toHaveBeenCalled();
                expect(company.name).toBe('Matech Studios');
            });
        });

        describe('Find one company by id', () => {
            it('should retrieve company if id is found', async () => {
                const company = await companiesService.getCompanyById('1');
                expect(mockEntityManager.findOne).toHaveBeenCalled();
                expect(company.name).toBe('Matech Studios');
            });
        });
    });
});
