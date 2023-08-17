import { Migration } from '@mikro-orm/migrations';

export class Migration20230309195056 extends Migration {

    async up(): Promise<void> {
        this.addSql('alter table "collectibles" add column "poapStatus" varchar(50);');
        //poapStatus
    }

    async down(): Promise<void> {
        this.addSql('alter table "collectibles" drop column "poapStatus";');
    }

}
