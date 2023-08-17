import { Migration } from '@mikro-orm/migrations';

export class Migration20230720141145 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'update "collectibles" set "attendees" = \'0\' where "attendees" = \'\';'
        );
        this.addSql(
            'alter table "collectibles" alter column "attendees" type int using ("attendees"::int);'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'alter table "collectibles" alter column "attendees" type varchar(255) using ("attendees"::varchar(255));'
        );
        this.addSql(
            'update "collectibles" set "attendees" = \'\' where "attendees" = \'0\';'
        );
    }
}
