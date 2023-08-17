import { Migration } from '@mikro-orm/migrations';

export class Migration20221230215721 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "companies" drop constraint "companies_name_unique";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "companies" add constraint "companies_name_unique" unique ("name");');
  }

}
