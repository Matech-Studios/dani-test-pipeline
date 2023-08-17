import { Migration } from '@mikro-orm/migrations';

export class Migration20230220161340 extends Migration {
    async up(): Promise<void> {
        this.addSql(
            'alter table "collectibles" alter column "name" type varchar(255) using ("name"::varchar(255));'
        );
        this.addSql(
            'alter table "collectibles" alter column "description" type varchar(255) using ("description"::varchar(255));'
        );
        this.addSql(
            'alter table "collectibles" alter column "description" drop not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "attendees" type varchar(255) using ("attendees"::varchar(255));'
        );
        this.addSql(
            'alter table "collectibles" alter column "attendees" drop not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "eventId" type varchar(255) using ("eventId"::varchar(255));'
        );
        this.addSql(
            'alter table "collectibles" alter column "eventId" drop not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "createdAt" type bigint using ("createdAt"::bigint);'
        );
        this.addSql(
            'alter table "collectibles" alter column "createdAt" set not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "updatedAt" type bigint using ("updatedAt"::bigint);'
        );
        this.addSql(
            'alter table "collectibles" drop constraint "collectibles_unique_name";'
        );
        this.addSql(
            'alter table "collectibles" add constraint "collectibles_eventId_foreign" foreign key ("eventId") references "events" ("id") on update cascade on delete cascade;'
        );
        this.addSql(
            'alter table "collectibles" add constraint "collectibles_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "collectibles" add constraint "collectibles_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;'
        );

        this.addSql(
            'alter table "questionnaires" alter column "type" type varchar(255) using ("type"::varchar(255));'
        );
        this.addSql(
            'alter table "questionnaires" alter column "createdAt" type bigint using ("createdAt"::bigint);'
        );
        this.addSql(
            'alter table "questionnaires" alter column "createdAt" set not null;'
        );
        this.addSql(
            'alter table "questionnaires" add constraint "questionnaires_collectibleId_foreign" foreign key ("collectibleId") references "collectibles" ("id") on update cascade on delete cascade;'
        );
        this.addSql(
            'alter table "questionnaires" add constraint "questionnaires_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "questionnaires" add constraint "questionnaires_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;'
        );

        this.addSql(
            'alter table "questionnaire_answers" alter column "createdAt" type bigint using ("createdAt"::bigint);'
        );
        this.addSql(
            'alter table "questionnaire_answers" alter column "createdAt" set not null;'
        );
        this.addSql(
            'alter table "questionnaire_answers" add constraint "questionnaire_answers_questionnaireId_foreign" foreign key ("questionnaireId") references "questionnaires" ("id") on update cascade on delete cascade;'
        );
        this.addSql(
            'alter table "questionnaire_answers" add constraint "questionnaire_answers_createdBy_foreign" foreign key ("createdBy") references "users" ("id") on update cascade on delete set null;'
        );
        this.addSql(
            'alter table "questionnaire_answers" add constraint "questionnaire_answers_updatedBy_foreign" foreign key ("updatedBy") references "users" ("id") on update cascade on delete set null;'
        );
    }

    async down(): Promise<void> {
        this.addSql(
            'alter table "collectibles" drop constraint "collectibles_eventId_foreign";'
        );
        this.addSql(
            'alter table "collectibles" drop constraint "collectibles_createdBy_foreign";'
        );
        this.addSql(
            'alter table "collectibles" drop constraint "collectibles_updatedBy_foreign";'
        );

        this.addSql(
            'alter table "questionnaire_answers" drop constraint "questionnaire_answers_questionnaireId_foreign";'
        );
        this.addSql(
            'alter table "questionnaire_answers" drop constraint "questionnaire_answers_createdBy_foreign";'
        );
        this.addSql(
            'alter table "questionnaire_answers" drop constraint "questionnaire_answers_updatedBy_foreign";'
        );

        this.addSql(
            'alter table "questionnaires" drop constraint "questionnaires_collectibleId_foreign";'
        );
        this.addSql(
            'alter table "questionnaires" drop constraint "questionnaires_createdBy_foreign";'
        );
        this.addSql(
            'alter table "questionnaires" drop constraint "questionnaires_updatedBy_foreign";'
        );

        this.addSql(
            'alter table "collectibles" alter column "name" type varchar using ("name"::varchar);'
        );
        this.addSql(
            'alter table "collectibles" alter column "description" type varchar using ("description"::varchar);'
        );
        this.addSql(
            'alter table "collectibles" alter column "description" set not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "attendees" type int4 using ("attendees"::int4);'
        );
        this.addSql(
            'alter table "collectibles" alter column "attendees" set not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "eventId" type varchar using ("eventId"::varchar);'
        );
        this.addSql(
            'alter table "collectibles" alter column "eventId" set not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "createdAt" type int8 using ("createdAt"::int8);'
        );
        this.addSql(
            'alter table "collectibles" alter column "createdAt" drop not null;'
        );
        this.addSql(
            'alter table "collectibles" alter column "updatedAt" type int8 using ("updatedAt"::int8);'
        );
        this.addSql(
            'alter table "collectibles" add constraint "collectibles_unique_name" unique ("name");'
        );

        this.addSql(
            'alter table "questionnaire_answers" alter column "createdAt" type int8 using ("createdAt"::int8);'
        );
        this.addSql(
            'alter table "questionnaire_answers" alter column "createdAt" drop not null;'
        );

        this.addSql(
            'alter table "questionnaires" alter column "type" type varchar using ("type"::varchar);'
        );
        this.addSql(
            'alter table "questionnaires" alter column "createdAt" type int8 using ("createdAt"::int8);'
        );
        this.addSql(
            'alter table "questionnaires" alter column "createdAt" drop not null;'
        );
    }
}
