import { Migration } from '@mikro-orm/migrations';

export class Migration20230405005722 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "raffles_winners" add column "order" int null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "raffles_winners" drop column "order";');
  }

}
