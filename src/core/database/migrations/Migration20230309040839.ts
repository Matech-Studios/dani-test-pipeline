import { Migration } from '@mikro-orm/migrations';

export class Migration20230309040839 extends Migration {

    async up(): Promise<void> {
        this.addSql(`CREATE TABLE IF NOT EXISTS "questionnaire_responses"
        (
            "id" varchar(255) NOT NULL,
            "collectibleId" varchar(255) NOT NULL,
            "beneficiary" varchar(255) NOT NULL,
            "question" varchar(255) NOT NULL,
            "answer" varchar(255) NOT NULL,
            "createdAt" bigint NOT NULL,
            CONSTRAINT "questionnaire_responses_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "beneficiary_collectibleId_question_unique" UNIQUE ("collectibleId", "beneficiary", "question"),
            CONSTRAINT "questionnaire_responses_collectibleId_foreign" FOREIGN KEY ("collectibleId")
                REFERENCES "collectibles" ("id") MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
        );
        
        COMMENT ON TABLE "questionnaire_responses"
            IS 'Responses from attendees to a given questionnaire (form)';`);
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "questionnaire_responses" cascade;');
    }
}
