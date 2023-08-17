import { Migration } from '@mikro-orm/migrations';

export class Migration20230302201931 extends Migration {

    async up(): Promise<void> {
        this.addSql(`alter table "events"
            add column "city" varchar(255) null,
            add column "country" varchar(255) null;`);

        this.addSql(`update "events" set
            "city" = (select "events"."location")
            where 1 = 1;`);

        this.addSql('alter table "events" drop column "location";');
    }

    async down(): Promise<void> {
        this.addSql(`alter table "events" add column "location" varchar(255) null;`);

        this.addSql(`update "events" set
            "location" = (select "events"."city")
            where 1 = 1;`);

        this.addSql('alter table "events" drop column "city", drop column "country";');
    }
}
