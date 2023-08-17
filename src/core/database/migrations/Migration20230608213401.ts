import { Migration } from '@mikro-orm/migrations';

export class Migration20230608213401 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'create table "user_resend_code_attempts" ("id" varchar(255) not null, "userId" varchar(255) not null, "type" varchar(50) not null, "timestamp" bigint not null, "createdAt" bigint not null, "updatedAt" bigint null, constraint "user_resend_code_attempts_pkey" primary key ("id"));'
        );
        this.addSql(
            'alter table "user_resend_code_attempts" add constraint "user_resend_code_attempts_userId_type_unique" unique ("userId", "type");'
        );

        this.addSql(
            'alter table "user_resend_code_attempts" add constraint "user_resend_code_attempts_userId_foreign" foreign key ("userId") references "users" ("id") on update cascade on delete cascade;'
        );

        this.addSql(
            'alter table "users" alter column "companyId" type varchar(255) using ("companyId"::varchar(255));'
        );
        this.addSql(
            'alter table "users" alter column "companyId" set not null;'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'drop table if exists "user_resend_code_attempts" cascade;'
        );

        this.addSql(
            'alter table "users" alter column "companyId" type varchar(255) using ("companyId"::varchar(255));'
        );
        this.addSql(
            'alter table "users" alter column "companyId" drop not null;'
        );
    }
}
