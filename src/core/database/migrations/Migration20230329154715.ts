import { Migration } from '@mikro-orm/migrations';

export class Migration20230329154715 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "questionnaire_answers" add column "type" varchar(255) null;'
        );
    }

    async down(): Promise<void> {
        this.addSql('alter table "questionnaire_answers" drop column "type";');
    }
}
