import { Migration } from '@mikro-orm/migrations';

export class Migration20230410174354 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "questionnaire_responses" alter column "answer" type varchar(1100) using ("answer"::varchar(1100));'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'alter table "questionnaire_responses" alter column "answer" type varchar(255) using ("answer"::varchar(255));'
        );
    }
}
