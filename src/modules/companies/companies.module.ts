import { Module } from '@nestjs/common';
import { CustomLogger } from 'src/core/utils';
import { CompanyService } from 'src/modules/companies/companies.service';

@Module({
    providers: [CustomLogger, CompanyService],
    exports: [CompanyService]
})
export class CompaniesModule {}
