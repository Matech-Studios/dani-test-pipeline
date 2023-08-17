import { Migration } from '@mikro-orm/migrations';

export class Migration20230225024138 extends Migration {

    async up(): Promise<void> {
        this.addSql(`ALTER TABLE "collectibles"
            add column "externalPoapId" integer,
            add column "secretCode" integer;`);
    }

    async down(): Promise<void> {
        this.addSql(`alter table "collectibles"
            drop column "externalPoapId",
            drop column "secretCode";`);
    }
}
