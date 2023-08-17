import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { CompanyDto } from 'src/core/dto/company.dto';
import { CompanyEntity } from 'src/core/entities';
import { UpdateCompanyEntity } from 'src/core/entities/updateCompany.entity';
import { CustomLogger } from 'src/core/utils';

@Injectable()
export class CompanyService {
    constructor(
        private readonly em: EntityManager,
        private logger: CustomLogger
    ) {}

    async create(companyName: string): Promise<CompanyDto> {
        try {
            const company = this.em.create(CompanyDto, {
                name: companyName
            });

            this.em.persistAndFlush(company);

            return company;
        } catch (error) {
            this.logger.log(`Error creating company: ${error}`, CompanyService.name);
            throw error;
        }
    }

    async update(company: UpdateCompanyEntity): Promise<void> {
        try {
            const companyDto: CompanyDto = await this.em.findOne(CompanyDto, {
                id: company.id
            });

            companyDto.name = company.name;
            companyDto.createdBy = company.createdBy;
            companyDto.updatedBy = company.updatedBy;

            await this.em.persistAndFlush(companyDto);
        } catch (error) {
            this.logger.log(`Error updating company: ${error}`, CompanyService.name);
            throw error;
        }
    }

    async getCompanyById(id: string): Promise<CompanyEntity> {
        try {
            const companyDto: CompanyDto = await this.em.findOne(CompanyDto, {
                id
            });
            const company: CompanyEntity = companyDto;
            return company;
        } catch (error) {
            this.logger.log(`getComanyById method: ${error}`, CompanyService.name);
            throw error;
        }
    }

    async getCompanyByName(name: string): Promise<CompanyEntity> {
        try {
            const companyDto: CompanyDto = await this.em.findOne(CompanyDto, {
                name: { $ilike: name }
            });
            const company: CompanyEntity = companyDto;
            return company;
        } catch (error) {
            this.logger.log(`getCompanyByName method: ${error}`, CompanyService.name);
            throw error;
        }
    }

    async deleteCompanyByName(companyName: string) {
        await this.em.nativeDelete(CompanyDto, {
            name: companyName
        });
    }

    async deleteCompanyById(id: string) {
        try {
            await this.em.nativeDelete(CompanyDto, {
                id
            });
        } catch (error) {
            this.logger.log(`deleteCompanyById method: ${error}`, CompanyService.name);
            throw error;
        }
    }
}
