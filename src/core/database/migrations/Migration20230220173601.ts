import { Migration } from '@mikro-orm/migrations';

export class Migration20230216014714 extends Migration {

    /***
     * These are fixes for incorrect date fields and company => companyId
    */
    async up(): Promise<void> {

        this.addSql(`alter table "events" rename column "company" to "companyId";`);

        this.addSql(`alter table "companies"
            add column "createdAtInt" BIGINT,
            add column "updatedAtInt" BIGINT,
            add column "createdBy" varchar(255) null,
            add column "updatedBy" varchar(255) null;`
        );

        this.addSql(`update "companies" set
            "createdAtInt" = (select (extract(epoch from ("companies"."createdAt")) * 1000)::bigint),
            "updatedAtInt" = (select (extract(epoch from ("companies"."updatedAt")) * 1000)::bigint)
            where 1 = 1;`);

        this.addSql('alter table "companies" drop column "createdAt", drop column "updatedAt";');
        this.addSql(`alter table "companies" rename column "createdAtInt" to "createdAt";`);
        this.addSql(`alter table "companies" rename column "updatedAtInt" to "updatedAt";`);
        this.addSql(`alter table "companies" alter column "createdAt" set not null;`);

        this.addSql('alter table "companies" add constraint "companies_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;');
        this.addSql('alter table "companies" add constraint "companies_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;');

        this.addSql('alter table "users" add column "createdAtInt" BIGINT, add column "updatedAtInt" BIGINT;');

        this.addSql(`update "users" set
            "createdAtInt" = (select (extract(epoch from ("users"."createdAt")) * 1000)::bigint),
            "updatedAtInt" = (select (extract(epoch from ("users"."updatedAt")) * 1000)::bigint)
            where 1 = 1;`);

        this.addSql('alter table "users" drop column "createdAt", drop column "updatedAt";');
        this.addSql(`alter table "users" rename column "createdAtInt" to "createdAt";`);
        this.addSql(`alter table "users" rename column "updatedAtInt" to "updatedAt";`);
        this.addSql(`alter table "users" alter column "createdAt" set not null;`);
    }

    async down(): Promise<void> {
        this.addSql(`alter table "companies"
            add column "createdAtDate" timestamptz(0) null,
            add column "updatedAtDate" timestamptz(0) null;`);

        this.addSql(`update "companies" set
            "createdAtDate" = (select to_timestamp("createdAt" / 1000.0)::timestamptz),
            "updatedAtDate" = (select to_timestamp("updatedAt" / 1000.0)::timestamptz)
            where 1 = 1;`);

        this.addSql('alter table "companies" drop constraint "companies_updatedBy_foreign";');
        this.addSql('alter table "companies" drop constraint "companies_createdBy_foreign";');
        this.addSql('alter table "companies" drop column "createdAt", drop column "updatedAt", drop column "createdBy", drop column "updatedBy";');
        this.addSql('alter table "companies" rename column "createdAtDate" to "createdAt";');
        this.addSql('alter table "companies" rename column "updatedAtDate" to "updatedAt";');

        this.addSql(`alter table "users"
            add column "createdAtDate" timestamptz(0) null,
            add column "updatedAtDate" timestamptz(0) null;`);

        this.addSql(`update "users" set
            "createdAtDate" = (select to_timestamp("createdAt" / 1000.0)::timestamptz),
            "updatedAtDate" = (select to_timestamp("updatedAt" / 1000.0)::timestamptz)
            where 1 = 1;`);

        this.addSql('alter table "users" drop column "createdAt", drop column "updatedAt";');
        this.addSql('alter table "users" rename column "createdAtDate" to "createdAt";');
        this.addSql('alter table "users" rename column "updatedAtDate" to "updatedAt";');

        this.addSql(`alter table "events" rename column "companyId" to "company";`);
    }
}
