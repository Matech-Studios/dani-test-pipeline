import { Migration } from '@mikro-orm/migrations';

export class Migration20230310191419 extends Migration {
    async up(): Promise<void> {
        this.addSql(`
            ALTER TABLE IF EXISTS "mint_links"
                ADD COLUMN "beneficiary" varchar(255);
            ALTER TABLE IF EXISTS "mint_links"
                ADD CONSTRAINT "mint_links_beneficiary_collectibleId_unique" UNIQUE ("collectibleId", beneficiary);
            `);
    }

    async down(): Promise<void> {
        this.addSql(`
            ALTER TABLE "mint_links" DROP CONSTRAINT IF EXISTS "mint_links_beneficiary_collectibleId_unique";
            ALTER TABLE "mint_links" DROP COLUMN "beneficiary";
        `);
    }
}
