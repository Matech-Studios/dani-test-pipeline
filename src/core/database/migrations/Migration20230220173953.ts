import { Migration } from '@mikro-orm/migrations';

export class Migration20230220053953 extends Migration {

    async up(): Promise<void> {

        /***
         * These are specific for card MM-72
        */
        this.addSql(`CREATE TABLE IF NOT EXISTS "raffles"
        (
            "id" varchar(255) NOT NULL,
            "name" varchar(150) NOT NULL,
            "key" integer NOT NULL,
            "useWeight" boolean NOT NULL DEFAULT false,
            "eventId" varchar(255) NOT NULL,
            "createdBy" varchar(255) NOT NULL,
            "updatedBy" varchar(255),
            "createdAt" bigint NOT NULL,
            "updatedAt" bigint,
            CONSTRAINT raffles_pkey PRIMARY KEY ("id"),
            CONSTRAINT "raffles_createdBy_foreign" FOREIGN KEY ("createdBy")
                REFERENCES "users" ("id") MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID,
            CONSTRAINT raffles_events_id FOREIGN KEY ("eventId")
                REFERENCES "events" ("id") MATCH SIMPLE
                ON UPDATE CASCADE
                ON DELETE CASCADE
                NOT VALID,
            CONSTRAINT "raffles_updatedBy_foreign" FOREIGN KEY ("updatedBy")
                REFERENCES "users" ("id") MATCH SIMPLE
                ON UPDATE NO ACTION
                ON DELETE NO ACTION
                NOT VALID
        );
        
        COMMENT ON TABLE "raffles"
            IS 'Stores events raffles';
        
        CREATE INDEX IF NOT EXISTS "fki_raffles_createdBy_foreign"
            ON "raffles" USING btree
            ("createdBy" ASC NULLS LAST)
            TABLESPACE pg_default;
        
        CREATE INDEX IF NOT EXISTS fki_raffles_events_id
            ON "raffles" USING btree
            ("eventId" ASC NULLS LAST)
            TABLESPACE pg_default;
        
        CREATE INDEX IF NOT EXISTS "fki_raffles_updatedBy_foreign"
            ON "raffles" USING btree
            ("updatedBy" ASC NULLS LAST)
            TABLESPACE pg_default;
        
        ALTER TABLE IF EXISTS "raffles"
            ADD CONSTRAINT raffle_unique_name UNIQUE ("name", "eventId");`);

        this.addSql(`CREATE TABLE IF NOT EXISTS "raffle_prizes"
            (
                "id" character varying(255) NOT NULL,
                "order" smallint NOT NULL,
                "details" character varying(150) NOT NULL,
                "quantity" smallint NOT NULL,
                "raffleId" character varying(255) NOT NULL,
                "createdBy" character varying(255) NOT NULL,
                "updatedBy" character varying(255) COLLATE pg_catalog."default",
                "createdAt" bigint NOT NULL,
                "updatedAt" bigint,
                CONSTRAINT raffle_prizes_pkey PRIMARY KEY ("id"),
                CONSTRAINT "raffle_prizes_createdBy_foreign" FOREIGN KEY ("createdBy")
                    REFERENCES "users" ("id") MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION,
                CONSTRAINT raffle_prizes_raffle_id FOREIGN KEY ("raffleId")
                    REFERENCES "raffles" ("id") MATCH SIMPLE
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                CONSTRAINT "raffle_prizes_updatedBy_foreign" FOREIGN KEY ("updatedBy")
                    REFERENCES "users" ("id") MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
            );
            
            ALTER TABLE IF EXISTS "raffle_prizes"
                ADD CONSTRAINT raffle_prizes_unique_name UNIQUE ("details", "raffleId");`);
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "raffle_prizes" cascade;');
        this.addSql('drop table if exists "raffles" cascade;');
    }
}
