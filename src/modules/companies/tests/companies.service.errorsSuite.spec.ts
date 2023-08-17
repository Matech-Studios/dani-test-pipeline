import { EntityManager } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from 'src/core/utils';
import { CompanyService } from 'src/modules/companies/companies.service';

describe('Companies Service', () => {
    let companiesService: CompanyService;

    describe('Errors Suite', () => {
        const mockExternalAuthService = {};

        const mockEntityManager = {
            create: jest.fn().mockImplementation(() => {
                throw new Error('create');
            }),
            findOne: jest.fn().mockImplementation(() => {
                throw new Error('findOne');
            }),
            find: jest.fn().mockImplementation(() => {
                throw new Error('find');
            }),
            nativeDelete: jest.fn().mockImplementation(() => {
                throw new Error('nativeDelete');
            }),
            persistAndFlush: jest.fn()
        };

        beforeEach(async () => {
            const moduleRef: TestingModule = await Test.createTestingModule({
                providers: [
                    CustomLogger,
                    CompanyService,
                    {
                        provide: 'ExternalAuthService',
                        useValue: mockExternalAuthService
                    },
                    {
                        provide: EntityManager,
                        useValue: mockEntityManager
                    }
                ]
            }).compile();

            companiesService = moduleRef.get<CompanyService>(CompanyService);
        });

        describe('Create company', () => {
            it('should throw an error while creating an company', async () => {
                await expect(companiesService.create('Error')).rejects.toThrowError(Error);

                expect(mockEntityManager.create).toHaveBeenCalled();
            });
        });

        describe('Find one company by name', () => {
            it('should throw an error while finding a company', async () => {
                await expect(companiesService.getCompanyByName('Error')).rejects.toThrowError(
                    Error
                );

                expect(mockEntityManager.findOne).toHaveBeenCalled();
            });
        });

        describe('Find one company by id', () => {
            it('should throw an error while retrieving a company', async () => {
                await expect(companiesService.getCompanyById('Error')).rejects.toThrowError(Error);

                expect(mockEntityManager.findOne).toHaveBeenCalled();
            });
        });

        describe('Delete company by id', () => {
            it('should delete a company', async () => {
                await expect(companiesService.deleteCompanyById('Error')).rejects.toThrowError(
                    Error
                );

                expect(mockEntityManager.nativeDelete).toHaveBeenCalled();
            });
        });

        describe('Delete company by name', () => {
            it('should delete a company', async () => {
                await expect(companiesService.deleteCompanyByName('Error')).rejects.toThrowError(
                    Error
                );

                expect(mockEntityManager.nativeDelete).toHaveBeenCalled();
            });
        });
    });
});
