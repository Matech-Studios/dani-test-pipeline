import { Migration } from '@mikro-orm/migrations';

export class Migration20230708060051 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "poap_settings" ("id" varchar(255) not null, "name" varchar(255) not null, "value" varchar(5000) not null, "createdBy" varchar(255) null, "updatedBy" varchar(255) null, "createdAt" bigint not null, "updatedAt" bigint null, constraint "poap_settings_pkey" primary key ("id"));');

    this.addSql('alter table "poap_settings" add constraint "poap_settings_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;');
    this.addSql('alter table "poap_settings" add constraint "poap_settings_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "poap_settings" cascade;');
  }

}
