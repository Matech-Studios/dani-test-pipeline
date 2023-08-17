import { Migration } from '@mikro-orm/migrations';

export class Migration20230302230759 extends Migration {

    async up(): Promise<void> {
        this.addSql(`CREATE TABLE IF NOT EXISTS mint_links
            (
                id varchar(255) NOT NULL,
                "qrHash" varchar(20) NOT NULL,
                claimed boolean NOT NULL,
                "collectibleId" varchar(255) NOT NULL,
                "createdBy" varchar(255) NOT NULL,
                "updatedBy" varchar(255),
                "createdAt" bigint NOT NULL,
                "updatedAt" bigint,
                CONSTRAINT mint_links_pkey PRIMARY KEY (id),
                CONSTRAINT "mint_links_qrHash_collectibleId_unique" UNIQUE ("qrHash", "collectibleId"),
                CONSTRAINT "mint_links_collectibleId_foreign" FOREIGN KEY ("collectibleId")
                    REFERENCES collectibles (id) MATCH SIMPLE
                    ON UPDATE CASCADE
                    ON DELETE CASCADE,
                CONSTRAINT "mint_links_createdBy_foreign" FOREIGN KEY ("createdBy")
                    REFERENCES "users" ("id") MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID,
                CONSTRAINT "mint_links_updatedBy_foreign" FOREIGN KEY ("updatedBy")
                    REFERENCES "users" ("id") MATCH SIMPLE
                    ON UPDATE NO ACTION
                    ON DELETE NO ACTION
                    NOT VALID
            );
            
            COMMENT ON TABLE mint_links
                IS 'All mint links that belong to each collectible.';`);
    }

    async down(): Promise<void> {
        this.addSql('drop table if exists "mint_links" cascade;');
    }
}
