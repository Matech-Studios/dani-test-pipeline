import { Migration } from '@mikro-orm/migrations';

export class Migration20230322193815 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "raffles" add column "status" varchar(255) null;'
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table "raffles" drop column "status";');
    }
}
