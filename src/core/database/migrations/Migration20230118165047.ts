import { Migration } from '@mikro-orm/migrations';

export class Migration20230118165047 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "events" alter column "multiDay" type boolean using ("multiDay"::boolean);');
    this.addSql('alter table "events" alter column "multiDay" set not null;');
    this.addSql('alter table "events" alter column "virtual" type boolean using ("virtual"::boolean);');
    this.addSql('alter table "events" alter column "virtual" set not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "events" alter column "multiDay" type boolean using ("multiDay"::boolean);');
    this.addSql('alter table "events" alter column "multiDay" drop not null;');
    this.addSql('alter table "events" alter column "virtual" type boolean using ("virtual"::boolean);');
    this.addSql('alter table "events" alter column "virtual" drop not null;');
  }

}
