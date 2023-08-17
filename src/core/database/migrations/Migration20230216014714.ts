import { Migration } from '@mikro-orm/migrations';

export class Migration20230216014714 extends Migration {

    async up(): Promise<void> {
        this.addSql('create table "questionnaires" ("id" varchar(255) not null, "key" int not null, "type" varchar(50) not null, "questionText" varchar(255) not null, "collectibleId" varchar(255) not null, "createdBy" varchar(255) not null, "updatedBy" varchar(255) null, "createdAt" bigint null, "updatedAt" bigint null, constraint "questionnaires_pkey" primary key ("id"));');
        this.addSql('create table "questionnaire_answers" ("id" varchar(255) not null, "answerKey" int not null, "answerText" varchar(255) not null, "questionnaireId" varchar(255) not null, "createdBy" varchar(255) not null, "updatedBy" varchar(255) null, "createdAt" bigint null, "updatedAt" bigint null, constraint "questionnaire_answers_pkey" primary key ("id"));');
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "questionnaire_answers" cascade;');
        this.addSql('drop table if exists "questionnaires" cascade;');
    }
}
