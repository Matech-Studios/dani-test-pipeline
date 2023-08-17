import { Migration } from '@mikro-orm/migrations';

export class Migration20230609204757 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "questionnaires" add column "isOptional" boolean not null default false;'
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table "questionnaires" drop column "isOptional";');
    }
}
