import { Migration } from '@mikro-orm/migrations';

export class Migration20230222173900 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "collectibles" add column "image" varchar(255) null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "collectibles" drop column "image";');
  }

}
