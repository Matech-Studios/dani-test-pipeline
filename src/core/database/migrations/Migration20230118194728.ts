import { Migration } from '@mikro-orm/migrations';

export class Migration20230118194728 extends Migration {

    async up(): Promise<void> {
        this.addSql('alter table "events" add column "createdAtInt" BIGINT, add column "updatedAtInt" BIGINT;');

        this.addSql(`update "events" set
            "createdAtInt" = (select (extract(epoch from ("events"."createdAt")) * 1000)::bigint),
            "updatedAtInt" = (select (extract(epoch from ("events"."updatedAt")) * 1000)::bigint)
            where 1 = 1;`);

        this.addSql('alter table "events" drop column "createdAt", drop column "updatedAt";');
        this.addSql(`alter table "events" rename column "createdAtInt" to "createdAt";`);
        this.addSql(`alter table "events" rename column "updatedAtInt" to "updatedAt";`);
        this.addSql(`alter table "events" alter column "createdAt" set not null;`);
    }

    async down(): Promise<void> {
        this.addSql(`alter table "events"
            add column "createdAtDate" timestamptz(0) null,
            add column "updatedAtDate" timestamptz(0) null;`);

        this.addSql(`update "events" set
            "createdAtDate" = (select to_timestamp("createdAt" / 1000.0)::timestamptz),
            "updatedAtDate" = (select to_timestamp("updatedAt" / 1000.0)::timestamptz)
            where 1 = 1;`);

        this.addSql('alter table "events" drop column "createdAt", drop column "updatedAt";');
        this.addSql('alter table "events" rename column "createdAtDate" to "createdAt";');
        this.addSql('alter table "events" rename column "updatedAtDate" to "updatedAt";');
    }
}
