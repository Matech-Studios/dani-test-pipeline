import { Migration } from '@mikro-orm/migrations';

export class Migration20230731121307 extends Migration {

  async up(): Promise<void> {
    // Add the new column "attendees" without "not null"
    this.addSql('alter table "events" add column "attendees" int;');
    
    // Set a default value for the new column on existing records
    this.addSql('update "events" set "attendees" = 0 where "attendees" is null;');    
    
    // Add the "not null" constraint
    this.addSql('alter table "events" alter column "attendees" set not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "events" drop column "attendees";');
  }

}
