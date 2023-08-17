import { Migration } from '@mikro-orm/migrations';

export class Migration20230402172300 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "raffles_winners" drop column "order";');
    this.addSql('alter table "raffles_winners" rename column "beneficiaries" to "beneficiary";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "raffles_winners" add column "order" int not null;');
    this.addSql('alter table "raffles_winners" rename column "beneficiary" to "beneficiaries";');
  }

}
