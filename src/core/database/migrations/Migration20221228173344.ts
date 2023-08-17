import { Migration } from '@mikro-orm/migrations';

export class Migration20221228173344 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "companies" ("id" varchar(255) not null, "name" varchar(255) not null, "createdAt" timestamptz(0) null, "updatedAt" timestamptz(0) null, constraint "companies_pkey" primary key ("id"));');
    this.addSql('alter table "companies" add constraint "companies_name_unique" unique ("name");');

    this.addSql('create table "users" ("id" varchar(255) not null, "externalUserId" varchar(255) not null, "name" varchar(255) not null, "lastName" varchar(255) not null, "companyId" varchar(255) null, "email" varchar(255) not null, "createdAt" timestamptz(0) null, "updatedAt" timestamptz(0) null, constraint "users_pkey" primary key ("id"));');
    this.addSql('alter table "users" add constraint "users_externalUserId_unique" unique ("externalUserId");');
    this.addSql('alter table "users" add constraint "users_companyId_unique" unique ("companyId");');
    this.addSql('alter table "users" add constraint "users_email_unique" unique ("email");');

    this.addSql('alter table "users" add constraint "users_companyId_foreign" foreign key ("companyId") references "companies" ("id") on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "users" drop constraint "users_companyId_foreign";');

    this.addSql('drop table if exists "companies" cascade;');

    this.addSql('drop table if exists "users" cascade;');
  }

}
