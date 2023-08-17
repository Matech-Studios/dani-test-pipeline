import { Migration } from '@mikro-orm/migrations';

export class Migration20230226034702 extends Migration {

    async up(): Promise<void> {
        this.addSql(`CREATE TABLE IF NOT EXISTS "collectibles_raffles"
        (
            "id" character varying(255) NOT NULL,
            "collectibleId" character varying(255) NOT NULL,
            "raffleId" character varying(255) NOT NULL,
            "score" integer,
            "createdBy" varchar(255) NOT NULL,
            "updatedBy" varchar(255),
            "createdAt" bigint NOT NULL,
            "updatedAt" bigint,
            CONSTRAINT collectibles_raffles_pkey PRIMARY KEY ("id"),
            CONSTRAINT collectibles_raffles_collectible_id FOREIGN KEY ("collectibleId")
                REFERENCES "collectibles" ("id") MATCH SIMPLE
                ON UPDATE CASCADE
                ON DELETE CASCADE,
            CONSTRAINT collectibles_raffles_raffle_id FOREIGN KEY ("raffleId")
                REFERENCES "raffles" ("id") MATCH SIMPLE
                ON UPDATE CASCADE
                ON DELETE CASCADE,
            CONSTRAINT "raffles_createdBy_foreign" FOREIGN KEY ("createdBy")
                REFERENCES "users" ("id") MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID,
            CONSTRAINT "raffles_updatedBy_foreign" FOREIGN KEY ("updatedBy")
                REFERENCES "users" ("id") MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID
        );
        
        CREATE UNIQUE INDEX IF NOT EXISTS collectibles_raffles_unique
            ON "collectibles_raffles" USING btree
            ("collectibleId", "raffleId");
            
        COMMENT ON TABLE "collectibles_raffles"
            IS 'Links raffles to collectibles';`);
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "collectibles_raffles" cascade;');
    }
}
