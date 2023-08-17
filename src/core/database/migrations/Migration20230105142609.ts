import { Migration } from '@mikro-orm/migrations';

export class Migration20230105142609 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "events" ("id" varchar(255) not null, "name" varchar(255) not null, "description" varchar(255) not null, "location" varchar(255) null, "startDate" bigint not null, "endDate" bigint null, "multiDay" boolean null, "virtual" boolean null, "poapsQuantity" int null, "createdBy" varchar(255) not null, "updatedBy" varchar(255) null, "company" varchar(255) not null, "createdAt" timestamptz(0) null, "updatedAt" timestamptz(0) null, constraint "events_pkey" primary key ("id"));');

    this.addSql('alter table "events" add constraint "events_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;');
    this.addSql('alter table "events" add constraint "events_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;');
    this.addSql('alter table "events" add constraint "events_company_foreign" foreign key ("company") references "companies" ("id") on update cascade on delete set null;');

    this.addSql('alter table "users" drop constraint "users_companyId_foreign";');

    this.addSql('alter table "users" alter column "companyId" type varchar(255) using ("companyId"::varchar(255));');
    this.addSql('alter table "users" alter column "companyId" set not null;');
    this.addSql('alter table "users" add constraint "users_companyId_foreign" foreign key ("companyId") references "companies" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "events" cascade;');

    this.addSql('alter table "users" drop constraint "users_companyId_foreign";');

    this.addSql('alter table "users" alter column "companyId" type varchar(255) using ("companyId"::varchar(255));');
    this.addSql('alter table "users" alter column "companyId" drop not null;');
    this.addSql('alter table "users" add constraint "users_companyId_foreign" foreign key ("companyId") references "companies" ("id") on delete cascade;');
  }

}
