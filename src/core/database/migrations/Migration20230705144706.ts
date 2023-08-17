import { Migration } from '@mikro-orm/migrations';

export class Migration20230705144706 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'ALTER TABLE "collectibles" ALTER COLUMN "description" TYPE varchar(1024);'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'ALTER TABLE "collectibles" ALTER COLUMN "description" TYPE varchar(255);'
        );
    }
}
